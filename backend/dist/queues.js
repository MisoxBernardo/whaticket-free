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
exports.startQueueProcess = exports.sendScheduledMessages = exports.scheduleMonitor = exports.messageQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const moment_1 = __importDefault(require("moment"));
const sequelize_1 = require("sequelize");
const SendMessage_1 = require("./helpers/SendMessage");
const Whatsapp_1 = __importDefault(require("./models/Whatsapp"));
const logger_1 = require("./utils/logger");
const Schedule_1 = __importDefault(require("./models/Schedule"));
const Contact_1 = __importDefault(require("./models/Contact"));
const GetDefaultWhatsApp_1 = __importDefault(require("./helpers/GetDefaultWhatsApp"));
const connection = process.env.REDIS_URI || "";
const limiterMax = process.env.REDIS_OPT_LIMITER_MAX || 1;
const limiterDuration = process.env.REDIS_OPT_LIMITER_DURATION || 3000;
exports.messageQueue = new bull_1.default("MessageQueue", connection, {
    limiter: {
        max: limiterMax,
        duration: limiterDuration
    }
});
exports.scheduleMonitor = new bull_1.default("ScheduleMonitor", connection);
exports.sendScheduledMessages = new bull_1.default("SendSacheduledMessages", connection);
function startQueueProcess() {
    logger_1.logger.info("Iniciando processamento de filas");
    exports.messageQueue.process("SendMessage", (job) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = job;
            const whatsapp = yield Whatsapp_1.default.findByPk(data.whatsappId);
            if (whatsapp == null) {
                throw Error("Whatsapp não identificado");
            }
            const messageData = data.data;
            yield (0, SendMessage_1.SendMessage)(whatsapp, messageData);
        }
        catch (e) {
            console.log(e);
            logger_1.logger.error("MessageQueue -> SendMessage: error", e.message);
            throw e;
        }
    }));
    exports.scheduleMonitor.process("Verify", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const { count, rows: schedules } = yield Schedule_1.default.findAndCountAll({
                where: {
                    status: "PENDENTE",
                    sentAt: null,
                    sendAt: {
                        [sequelize_1.Op.lt]: new Date()
                    }
                },
                include: [{ model: Contact_1.default, as: "contact" }]
            });
            if (count > 0) {
                schedules.map((schedule) => __awaiter(this, void 0, void 0, function* () {
                    yield schedule.update({
                        status: "AGENDADA"
                    });
                    exports.sendScheduledMessages.add("SendMessage", { schedule }, { delay: 40000 });
                    logger_1.logger.info(`Disparo agendado para: ${schedule.contact.name}`);
                }));
            }
        }
        catch (e) {
            logger_1.logger.error("SendScheduledMessage -> Verify: error", e.message);
            throw e;
        }
    }));
    exports.sendScheduledMessages.process("SendMessage", (job) => __awaiter(this, void 0, void 0, function* () {
        const { data: { schedule } } = job;
        let scheduleRecord = null;
        try {
            scheduleRecord = yield Schedule_1.default.findByPk(schedule.id);
        }
        catch (e) {
            logger_1.logger.info(`Erro ao tentar consultar agendamento: ${schedule.id}`);
        }
        try {
            const whatsapp = yield (0, GetDefaultWhatsApp_1.default)();
            yield (0, SendMessage_1.SendMessage)(whatsapp, {
                number: schedule.contact.number,
                body: schedule.body
            });
            yield (scheduleRecord === null || scheduleRecord === void 0 ? void 0 : scheduleRecord.update({
                sentAt: (0, moment_1.default)().format("YYYY-MM-DD HH:mm"),
                status: "ENVIADA"
            }));
            logger_1.logger.info(`Mensagem agendada enviada para: ${schedule.contact.name}`);
            exports.sendScheduledMessages.clean(15000, "completed");
        }
        catch (e) {
            yield (scheduleRecord === null || scheduleRecord === void 0 ? void 0 : scheduleRecord.update({
                status: "ERRO"
            }));
            logger_1.logger.error("SendScheduledMessage -> SendMessage: error", e.message);
            throw e;
        }
    }));
    // eslint-disable-next-line no-restricted-syntax
    // for (const status of ["active", "completed", "delayed", "failed", "wait"]) {
    //   sendScheduledMessages.clean(100, status);
    // }
    exports.scheduleMonitor.add("Verify", {}, {
        repeat: { cron: "*/5 * * * * *" },
        removeOnComplete: false
    });
}
exports.startQueueProcess = startQueueProcess;
