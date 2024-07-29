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
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./libs/socket");
const logger_1 = require("./utils/logger");
const http_graceful_shutdown_1 = __importDefault(require("http-graceful-shutdown"));
const StartAllWhatsAppsSessions_1 = require("./services/WbotServices/StartAllWhatsAppsSessions");
const PORT = process.env.PORT || 8081;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Inicializar o servidor HTTP
        const server = http_1.default.createServer(app_1.default);
        // Inicializar o Socket.IO
        (0, socket_1.initIO)(server);
        // Inicializar todas as sessões do WhatsApp
        yield (0, StartAllWhatsAppsSessions_1.StartAllWhatsAppsSessions)();
        // Iniciar o servidor HTTP
        server.listen(PORT, () => {
            logger_1.logger.info(`Server started on port: ${PORT}`);
        });
        // Configurar graceful shutdown
        (0, http_graceful_shutdown_1.default)(server);
    }
    catch (error) {
        logger_1.logger.error("Failed to start server", error);
        process.exit(1); // Exit process with failure
    }
});
// Iniciar o servidor
startServer();
