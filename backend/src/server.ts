import http from "http";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import gracefulShutdown from "http-graceful-shutdown";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";

const PORT = process.env.PORT || 8081;

const startServer = async () => {
  try {
    // Inicializar o servidor HTTP
    const server = http.createServer(app);

    // Inicializar o Socket.IO
    initIO(server);

    // Inicializar todas as sessões do WhatsApp
    await StartAllWhatsAppsSessions();

    // Iniciar o servidor HTTP
    server.listen(PORT, () => {
      logger.info(`Server started on port: ${PORT}`);
    });

    // Configurar graceful shutdown
    gracefulShutdown(server);

  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1); // Exit process with failure
  }
};

// Iniciar o servidor
startServer();
