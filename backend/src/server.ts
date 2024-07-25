import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import cors from 'cors';

// Configurar o CORS para permitir requisições de fenix.ticket
const corsOptions = {
  origin: ["http://fenix.ticket", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Usa a porta definida no .env, se existir
const port = process.env.PORT || 8081;

const server = app.listen(port, () => {
  logger.info(`Server started on port: ${port}`);
});

// Inicializa as conexões do Socket.IO
initIO(server);

// Inicia todas as sessões do WhatsApp
StartAllWhatsAppsSessions();

// Configura o desligamento gracioso do servidor
gracefulShutdown(server);
