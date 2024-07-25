"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initIO = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = require("jsonwebtoken");
const AppError_1 = __importDefault(require("../errors/AppError"));
const logger_1 = require("../utils/logger");
const auth_1 = __importDefault(require("../config/auth"));
const User_1 = __importDefault(require("../models/User"));
const Queue_1 = __importDefault(require("../models/Queue"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
let io;
const initIO = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL
        }
    });
    io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
        const { token } = socket.handshake.query;
        let tokenData = null;
        try {
            tokenData = (0, jsonwebtoken_1.verify)(token, auth_1.default.secret);
            logger_1.logger.debug(tokenData, "io-onConnection: tokenData");
        }
        catch (error) {
            logger_1.logger.error(error, "Error decoding token");
            socket.disconnect();
            return io;
        }
        const userId = tokenData.id;
        let user = null;
        if (userId && userId !== "undefined" && userId !== "null") {
            user = yield User_1.default.findByPk(userId, { include: [Queue_1.default] });
        }
        logger_1.logger.info("Client Connected");
        socket.on("joinChatBox", (ticketId) => {
            if (ticketId === "undefined") {
                return;
            }
            Ticket_1.default.findByPk(ticketId).then(ticket => {
                // only admin and the current user of the ticket
                // can join the message channel of it.
                if (ticket &&
                    ((ticket === null || ticket === void 0 ? void 0 : ticket.userId) === user.id || user.profile === "admin")) {
                    logger_1.logger.debug(`User ${user.id} joined ticket ${ticketId} channel`);
                    socket.join(ticketId);
                }
                else {
                    logger_1.logger.info(`Invalid attempt to join chanel of ticket ${ticketId} by user ${user.id}`);
                }
            }, error => {
                logger_1.logger.error(error, `Error fetching ticket ${ticketId}`);
            });
        });
        socket.on("joinNotification", () => {
            if (user.profile === "admin") {
                // admin can join all notifications
                logger_1.logger.debug(`Admin ${user.id} joined the notification channel.`);
                socket.join("notification");
            }
            else {
                // normal users join notifications of the queues they participate
                user.queues.forEach(queue => {
                    logger_1.logger.debug(`User ${user.id} joined queue ${queue.id} channel.`);
                    socket.join(`queue-${queue.id}-notification`);
                });
            }
        });
        socket.on("joinTickets", (status) => {
            if (user.profile === "admin") {
                // only admin can join the notifications of a particular status
                logger_1.logger.debug(`Admin ${user.id} joined ${status} tickets channel.`);
                socket.join(`${status}`);
            }
            else {
                // normal users can only receive messages of the queues they participate
                user.queues.forEach(queue => {
                    logger_1.logger.debug(`User ${user.id} joined queue ${queue.id} ${status} tickets channel.`);
                    socket.join(`queue-${queue.id}-${status}`);
                });
            }
        });
        socket.on("disconnect", () => {
            logger_1.logger.info("Client disconnected");
        });
        socket.emit("ready");
    }));
    return io;
};
exports.initIO = initIO;
const getIO = () => {
    if (!io) {
        throw new AppError_1.default("Socket IO not initialized");
    }
    return io;
};
exports.getIO = getIO;
