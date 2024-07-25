import express from "express";
import cors from "cors";
import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";

// Configurações do CORS
const corsOptions = {
  origin: ["http://localhost:3000", "http://fenix.ticket:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

const server = app.listen(process.env.PORT || 8080, () => {
  logger.info(`Server started on port: ${process.env.PORT || 8080}`);
});

initIO(server);
StartAllWhatsAppsSessions();
gracefulShutdown(server);
