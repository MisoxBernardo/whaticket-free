import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import { verify } from "jsonwebtoken";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import authConfig from "../config/auth";
import User from "../models/User";
import Queue from "../models/Queue";
import Ticket from "../models/Ticket";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (origin === process.env.FRONTEND_URL || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", async socket => {
    const { token } = socket.handshake.query;
    let tokenData = null;
    try {
      tokenData = verify(token as string, authConfig.secret);
      logger.debug(tokenData, "io-onConnection: tokenData");
    } catch (error) {
      logger.error(error, "Error decoding token");
      socket.disconnect();
      return;
    }

    const userId = tokenData.id;

    let user: User | null = null;
    if (userId && userId !== "undefined" && userId !== "null") {
      user = await User.findByPk(userId, { include: [Queue] });
    }

    if (user) {
      logger.info("Client Connected");
      
      socket.on("joinChatBox", async (ticketId: string) => {
        if (ticketId === "undefined") return;
        
        try {
          const ticket = await Ticket.findByPk(ticketId);
          if (ticket && (ticket.userId === user.id || user.profile === "admin")) {
            logger.debug(`User ${user.id} joined ticket ${ticketId} channel`);
            socket.join(ticketId);
          } else {
            logger.info(`Invalid attempt to join channel of ticket ${ticketId} by user ${user.id}`);
          }
        } catch (error) {
          logger.error(error, `Error fetching ticket ${ticketId}`);
        }
      });

      socket.on("joinNotification", () => {
        if (user.profile === "admin") {
          logger.debug(`Admin ${user.id} joined the notification channel.`);
          socket.join("notification");
        } else {
          user.queues.forEach(queue => {
            logger.debug(`User ${user.id} joined queue ${queue.id} channel.`);
            socket.join(`queue-${queue.id}-notification`);
          });
        }
      });

      socket.on("joinTickets", (status: string) => {
        if (user.profile === "admin") {
          logger.debug(`Admin ${user.id} joined ${status} tickets channel.`);
          socket.join(status);
        } else {
          user.queues.forEach(queue => {
            logger.debug(`User ${user.id} joined queue ${queue.id} ${status} tickets channel.`);
            socket.join(`queue-${queue.id}-${status}`);
          });
        }
      });

      socket.on("disconnect", () => {
        logger.info("Client disconnected");
      });

      socket.emit("ready");
    } else {
      logger.warn("User not found");
      socket.disconnect();
    }
  });

  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
