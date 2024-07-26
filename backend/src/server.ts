import http from "http";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import gracefulShutdown from "http-graceful-shutdown";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";

// Inicializar o servidor HTTP
const server = http.createServer(app);

initIO(server);

server.listen(process.env.PORT || 8081, () => {
  logger.info(`Server started on port: ${process.env.PORT || 8081}`);
});

StartAllWhatsAppsSessions();
gracefulShutdown(server);
