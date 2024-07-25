"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.initWbot = exports.removeWbot = exports.getWbot = void 0;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const node_cache_1 = __importDefault(require("node-cache"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const logger_2 = require("../utils/logger");
const AppError_1 = __importDefault(require("../errors/AppError"));
const socket_1 = require("./socket");
const StartWhatsAppSession_1 = require("../services/WbotServices/StartWhatsAppSession");
const DeleteBaileysService_1 = __importDefault(require("../services/BaileysServices/DeleteBaileysService"));
const useMultiFileAuthState_1 = require("../helpers/useMultiFileAuthState");
const BaileysSessions_1 = __importDefault(require("../models/BaileysSessions"));
const msgRetryCounterCache = new node_cache_1.default();
const loggerBaileys = logger_1.default.child({});
loggerBaileys.level = "silent";
const sessions = [];
const retriesQrCodeMap = new Map();
const getWbot = (whatsappId) => {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex === -1) {
        throw new AppError_1.default("ERR_WAPP_NOT_INITIALIZED");
    }
    return sessions[sessionIndex];
};
exports.getWbot = getWbot;
const removeWbot = (whatsappId, isLogout = true) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
        if (sessionIndex !== -1) {
            if (isLogout) {
                sessions[sessionIndex].logout();
                sessions[sessionIndex].ws.close();
            }
            sessions.splice(sessionIndex, 1);
        }
    }
    catch (err) {
        logger_2.logger.error(err);
    }
});
exports.removeWbot = removeWbot;
const initWbot = (whatsapp) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        try {
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const io = (0, socket_1.getIO)();
                const whatsappUpdate = yield Whatsapp_1.default.findOne({
                    where: { id: whatsapp.id }
                });
                if (!whatsappUpdate)
                    return;
                const { id, name, isMultidevice } = whatsappUpdate;
                const { isLatest, version } = yield (0, baileys_1.fetchLatestBaileysVersion)();
                logger_2.logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
                logger_2.logger.info(`isMultidevice: ${isMultidevice}`);
                logger_2.logger.info(`Starting session ${name}`);
                let retriesQrCode = 0;
                let wsocket = null;
                const store = (0, baileys_1.makeInMemoryStore)({
                    logger: loggerBaileys
                });
                const { state, saveCreds } = yield (0, useMultiFileAuthState_1.useMultiFileAuthState)(whatsapp);
                wsocket = (0, baileys_1.default)({
                    logger: loggerBaileys,
                    printQRInTerminal: false,
                    auth: state,
                    version,
                    msgRetryCounterCache,
                    getMessage: (key) => __awaiter(void 0, void 0, void 0, function* () {
                        if (store) {
                            const msg = yield store.loadMessage(key.remoteJid, key.id);
                            return (msg === null || msg === void 0 ? void 0 : msg.message) || undefined;
                        }
                    })
                });
                wsocket.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b;
                    logger_2.logger.info(`Socket  ${name} Connection Update ${connection || ""} ${lastDisconnect || ""}`);
                    const disconect = (_b = (_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode;
                    if (connection === "close") {
                        if (disconect === 403) {
                            yield whatsapp.update({
                                status: "PENDING",
                                session: "",
                                number: ""
                            });
                            yield (0, DeleteBaileysService_1.default)(whatsapp.id);
                            yield BaileysSessions_1.default.destroy({
                                where: {
                                    whatsappId: whatsapp.id
                                }
                            });
                            io.emit("whatsappSession", {
                                action: "update",
                                session: whatsapp
                            });
                            (0, exports.removeWbot)(id, false);
                        }
                        if (disconect !== baileys_1.DisconnectReason.loggedOut) {
                            (0, exports.removeWbot)(id, false);
                            setTimeout(() => (0, StartWhatsAppSession_1.StartWhatsAppSession)(whatsapp), 2000);
                        }
                        if (disconect === baileys_1.DisconnectReason.loggedOut) {
                            yield whatsapp.update({
                                status: "PENDING",
                                session: "",
                                number: ""
                            });
                            yield (0, DeleteBaileysService_1.default)(whatsapp.id);
                            yield BaileysSessions_1.default.destroy({
                                where: {
                                    whatsappId: whatsapp.id
                                }
                            });
                            io.emit("whatsappSession", {
                                action: "update",
                                session: whatsapp
                            });
                            (0, exports.removeWbot)(id, false);
                            setTimeout(() => (0, StartWhatsAppSession_1.StartWhatsAppSession)(whatsapp), 2000);
                        }
                    }
                    if (connection === "open") {
                        yield whatsapp.update({
                            status: "CONNECTED",
                            qrcode: "",
                            retries: 0
                        });
                        io.emit("whatsappSession", {
                            action: "update",
                            session: whatsapp
                        });
                        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
                        if (sessionIndex === -1) {
                            wsocket.id = whatsapp.id;
                            sessions.push(wsocket);
                        }
                        resolve(wsocket);
                    }
                    if (qr !== undefined) {
                        if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
                            yield whatsappUpdate.update({
                                status: "DISCONNECTED",
                                qrcode: ""
                            });
                            yield (0, DeleteBaileysService_1.default)(whatsappUpdate.id);
                            yield BaileysSessions_1.default.destroy({
                                where: {
                                    whatsappId: whatsapp.id
                                }
                            });
                            io.emit("whatsappSession", {
                                action: "update",
                                session: whatsappUpdate
                            });
                            wsocket.ev.removeAllListeners("connection.update");
                            wsocket.ws.close();
                            wsocket = null;
                            // retriesQrCode = 0;
                            retriesQrCodeMap.delete(id);
                        }
                        else {
                            logger_2.logger.info(`Session QRCode Generate ${name}`);
                            retriesQrCodeMap.set(id, (retriesQrCode += 1));
                            yield whatsapp.update({
                                qrcode: qr,
                                status: "qrcode",
                                retries: 0
                            });
                            const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
                            if (sessionIndex === -1) {
                                wsocket.id = whatsapp.id;
                                sessions.push(wsocket);
                            }
                            io.emit("whatsappSession", {
                                action: "update",
                                session: whatsapp
                            });
                        }
                    }
                }));
                wsocket.ev.on("creds.update", saveCreds);
                wsocket.store = store;
                store.bind(wsocket.ev);
            }))();
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
});
exports.initWbot = initWbot;
