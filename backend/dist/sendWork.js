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
exports.runSendMessage = exports.IntervalMap = exports.scheduleMonitor = void 0;
const bull_1 = __importDefault(require("bull"));
const moment_1 = __importDefault(require("moment"));
const wbot_1 = require("./libs/wbot");
const Contact_1 = __importDefault(require("./models/Contact"));
const MassMessages_1 = __importDefault(require("./models/MassMessages"));
const SettingMessage_1 = __importDefault(require("./models/SettingMessage"));
const FindOrCreateTicketService_1 = __importDefault(require("./services/TicketServices/FindOrCreateTicketService"));
const wbotMessageListener_1 = require("./services/WbotServices/wbotMessageListener");
const ListWhatsAppsService_1 = __importDefault(require("./services/WhatsappService/ListWhatsAppsService"));
const logger_1 = require("./utils/logger");
let jobWork;
const connection = process.env.REDIS_URI || "";
const limiterMax = process.env.REDIS_OPT_LIMITER_MAX || 1;
const limiterDuration = process.env.REDIS_OPT_LIMITER_DURATION || 3000;
exports.scheduleMonitor = new bull_1.default("ScheduleMonitorSend", connection, {
    limiter: {
        max: limiterMax,
        duration: limiterDuration
    }
});
exports.IntervalMap = new Map();
const verifyNumber = (phone, whatsappId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wbot = (0, wbot_1.getWbot)(whatsappId);
        const [result] = yield wbot.onWhatsApp(`${phone}@s.whatsapp.net`);
        return result;
    }
    catch (error) {
        logger_1.logger.error(error);
        return null;
    }
});
const picturePhone = (phone, whatsappId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wbot = (0, wbot_1.getWbot)(whatsappId);
        const pictureUrl = yield wbot.profilePictureUrl(`${phone}@s.whatsapp.net`);
        return pictureUrl;
    }
    catch (error) {
        return error;
    }
});
const sendMessageWhatsapp = (jid, schedule) => __awaiter(void 0, void 0, void 0, function* () {
    const wbot = (0, wbot_1.getWbot)(schedule.whatsappId);
    let contact;
    contact = yield Contact_1.default.findOne({
        where: { number: schedule.phone }
    });
    if (!contact) {
        contact = yield Contact_1.default.create({
            number: schedule.phone,
            name: schedule.phone
        });
    }
    const contactAndTicket = yield (0, FindOrCreateTicketService_1.default)({
        contact,
        whatsappId: schedule.whatsappId,
        channel: "whatsapp"
    });
    const send = yield wbot.sendMessage(jid, {
        text: schedule.message
    });
    yield (0, wbotMessageListener_1.verifyMessage)(send, contactAndTicket, contact);
    yield schedule.update({
        status: "sent"
    });
    logger_1.logger.info(`${schedule.phone} - mensagem enviada`);
});
const sendMessage = (whatsappId, photo) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info("sendMessage", Date.now());
    if (!whatsappId || whatsappId === null || whatsappId === undefined)
        return;
    const getMessage = yield MassMessages_1.default.findOne({
        where: {
            whatsappId,
            status: "pending"
        }
    });
    if (!getMessage) {
        logger_1.logger.info("Não há mensagens pendentes");
        return;
    }
    const checkerNumber = yield verifyNumber(getMessage.phone, whatsappId);
    if (!(checkerNumber === null || checkerNumber === void 0 ? void 0 : checkerNumber.exists)) {
        logger_1.logger.error(`${getMessage.phone} - não existe`);
        yield getMessage.update({
            status: "number not exists"
        });
        return;
    }
    let isContactPhoto;
    if (photo) {
        try {
            const pictureUrl = yield picturePhone(getMessage.phone, whatsappId);
            logger_1.logger.info(pictureUrl);
            isContactPhoto = true;
        }
        catch (error) {
            isContactPhoto = false;
        }
    }
    if (photo && !isContactPhoto) {
        logger_1.logger.warn(`${getMessage.phone} - não tem foto, não enviar por que o contato não tem foto`);
        yield getMessage.update({
            status: "no photo contact"
        });
        return;
    }
    if (photo && isContactPhoto) {
        logger_1.logger.info(`${getMessage.phone} - fazendo o envio para o whatsapp para usuário com e sem foto!`);
        yield sendMessageWhatsapp(checkerNumber.jid, getMessage);
    }
    if (!photo) {
        yield sendMessageWhatsapp(checkerNumber.jid, getMessage);
    }
});
const processMessage = (whatsappId) => __awaiter(void 0, void 0, void 0, function* () {
    const setting = yield SettingMessage_1.default.findOne({
        where: {
            whatsappId
        }
    });
    if (!setting) {
        logger_1.logger.info("Configuração de envio não encontrada da conexão");
        return;
    }
    const { limit, minutes, seconds, photo, random } = setting;
    if (!limit) {
        logger_1.logger.warn(`conexão sem limite configurado, envio parado. ${setting.whatsappId}`);
        return;
    }
    logger_1.logger.info(`limit: ${limit} minutes: ${minutes} seconds: ${seconds} photo: ${photo} random: ${random}`);
    const time = minutes * 60 * 1000 + seconds * 1000;
    const intervalExist = exports.IntervalMap.get(whatsappId);
    if (!intervalExist) {
        const interval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.logger.info(`Iniciando a conexao com id ${whatsappId} as - ${new Date()}`);
            // validar limite, hora  de inicio e hora de fim
            const lastUpdate = (0, moment_1.default)(setting.updatedAt);
            const now = (0, moment_1.default)();
            const diff = now.diff(lastUpdate, "hours");
            if (diff > 24) {
                yield setting.update({
                    sendToday: 0
                });
            }
            else if (setting.sendToday >= setting.limit) {
                console.log(`Limite de envio atingido ${whatsappId}`);
                return;
            }
            if (whatsappId) {
                sendMessage(whatsappId, photo);
            }
        }), time); // mudar pro time
        exports.IntervalMap.set(whatsappId, interval);
    }
});
const runSendMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!jobWork) {
        const whatsapps = yield (0, ListWhatsAppsService_1.default)();
        if (!whatsapps) {
            logger_1.logger.info("Não há conexões cadastradas");
            return;
        }
        const whatsappConnected = whatsapps.filter((whatsapp) => whatsapp.status === "CONNECTED");
        if (!whatsappConnected.length) {
            logger_1.logger.info("Nenhum whatsapp conectado");
            return;
        }
        jobWork = true;
        whatsappConnected.forEach((whatsapp) => __awaiter(void 0, void 0, void 0, function* () {
            if (whatsapp) {
                processMessage(whatsapp.id);
            }
        }));
        logger_1.logger.info(`Total de conexao Prontas para envio!: ${whatsappConnected.length}`);
    }
});
exports.runSendMessage = runSendMessage;
