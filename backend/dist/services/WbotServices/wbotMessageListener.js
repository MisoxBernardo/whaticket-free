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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessage = exports.wbotMessageListener = exports.verifyMessage = exports.getQuotedMessageId = exports.getQuotedMessage = exports.getBodyMessage = void 0;
const path_1 = require("path");
const util_1 = require("util");
const fs_1 = require("fs");
const Sentry = __importStar(require("@sentry/node"));
const baileys_1 = require("@whiskeysockets/baileys");
const Message_1 = __importDefault(require("../../models/Message"));
const socket_1 = require("../../libs/socket");
const CreateMessageService_1 = __importDefault(require("../MessageServices/CreateMessageService"));
const logger_1 = require("../../utils/logger");
const CreateOrUpdateContactService_1 = __importDefault(require("../ContactServices/CreateOrUpdateContactService"));
const FindOrCreateTicketService_1 = __importDefault(require("../TicketServices/FindOrCreateTicketService"));
const ShowWhatsAppService_1 = __importDefault(require("../WhatsappService/ShowWhatsAppService"));
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const Setting_1 = __importDefault(require("../../models/Setting"));
const Debounce_1 = require("../../helpers/Debounce");
const UpdateTicketService_1 = __importDefault(require("../TicketServices/UpdateTicketService"));
const ChatBotListener_1 = require("./ChatBotListener");
const hourExpedient_1 = __importDefault(require("./hourExpedient"));
const writeFileAsync = (0, util_1.promisify)(fs_1.writeFile);
const getTypeMessage = (msg) => {
    return (0, baileys_1.getContentType)(msg.message);
};
const getBodyButton = (msg) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
    if (msg.key.fromMe && ((_b = (_a = msg === null || msg === void 0 ? void 0 : msg.message) === null || _a === void 0 ? void 0 : _a.buttonsMessage) === null || _b === void 0 ? void 0 : _b.contentText)) {
        let bodyMessage = `*${(_d = (_c = msg === null || msg === void 0 ? void 0 : msg.message) === null || _c === void 0 ? void 0 : _c.buttonsMessage) === null || _d === void 0 ? void 0 : _d.contentText}*`;
        // eslint-disable-next-line no-restricted-syntax
        for (const buton of (_f = (_e = msg.message) === null || _e === void 0 ? void 0 : _e.buttonsMessage) === null || _f === void 0 ? void 0 : _f.buttons) {
            bodyMessage += `\n\n${(_g = buton.buttonText) === null || _g === void 0 ? void 0 : _g.displayText}`;
        }
        return bodyMessage;
    }
    if (msg.key.fromMe && ((_h = msg === null || msg === void 0 ? void 0 : msg.message) === null || _h === void 0 ? void 0 : _h.listMessage)) {
        let bodyMessage = `*${(_k = (_j = msg === null || msg === void 0 ? void 0 : msg.message) === null || _j === void 0 ? void 0 : _j.listMessage) === null || _k === void 0 ? void 0 : _k.description}*`;
        // eslint-disable-next-line no-restricted-syntax
        for (const buton of (_m = (_l = msg.message) === null || _l === void 0 ? void 0 : _l.listMessage) === null || _m === void 0 ? void 0 : _m.sections) {
            // eslint-disable-next-line no-restricted-syntax
            for (const rows of buton.rows) {
                bodyMessage += `\n\n${rows.title}`;
            }
        }
        return bodyMessage;
    }
    if (msg.key.fromMe && ((_q = (_p = (_o = msg === null || msg === void 0 ? void 0 : msg.message) === null || _o === void 0 ? void 0 : _o.viewOnceMessage) === null || _p === void 0 ? void 0 : _p.message) === null || _q === void 0 ? void 0 : _q.listMessage)) {
        let bodyMessage = `*${(_u = (_t = (_s = (_r = msg === null || msg === void 0 ? void 0 : msg.message) === null || _r === void 0 ? void 0 : _r.viewOnceMessage) === null || _s === void 0 ? void 0 : _s.message) === null || _t === void 0 ? void 0 : _t.listMessage) === null || _u === void 0 ? void 0 : _u.description}*`;
        // eslint-disable-next-line no-restricted-syntax
        for (const buton of (_y = (_x = (_w = (_v = msg === null || msg === void 0 ? void 0 : msg.message) === null || _v === void 0 ? void 0 : _v.viewOnceMessage) === null || _w === void 0 ? void 0 : _w.message) === null || _x === void 0 ? void 0 : _x.listMessage) === null || _y === void 0 ? void 0 : _y.sections) {
            // eslint-disable-next-line no-restricted-syntax
            for (const rows of buton.rows) {
                bodyMessage += `\n\n${rows.title}`;
            }
        }
        return bodyMessage;
    }
    if (msg.key.fromMe &&
        ((_1 = (_0 = (_z = msg === null || msg === void 0 ? void 0 : msg.message) === null || _z === void 0 ? void 0 : _z.viewOnceMessage) === null || _0 === void 0 ? void 0 : _0.message) === null || _1 === void 0 ? void 0 : _1.buttonsMessage)) {
        let bodyMessage = `*${(_5 = (_4 = (_3 = (_2 = msg === null || msg === void 0 ? void 0 : msg.message) === null || _2 === void 0 ? void 0 : _2.viewOnceMessage) === null || _3 === void 0 ? void 0 : _3.message) === null || _4 === void 0 ? void 0 : _4.buttonsMessage) === null || _5 === void 0 ? void 0 : _5.contentText}*`;
        // eslint-disable-next-line no-restricted-syntax
        for (const buton of (_9 = (_8 = (_7 = (_6 = msg === null || msg === void 0 ? void 0 : msg.message) === null || _6 === void 0 ? void 0 : _6.viewOnceMessage) === null || _7 === void 0 ? void 0 : _7.message) === null || _8 === void 0 ? void 0 : _8.buttonsMessage) === null || _9 === void 0 ? void 0 : _9.buttons) {
            bodyMessage += `\n\n${(_10 = buton.buttonText) === null || _10 === void 0 ? void 0 : _10.displayText}`;
        }
        return bodyMessage;
    }
};
const msgLocation = (image, latitude, longitude) => {
    if (image) {
        const b64 = Buffer.from(image).toString("base64");
        const data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude}, ${longitude} `;
        return data;
    }
};
const getBodyMessage = (msg) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    try {
        const type = getTypeMessage(msg);
        const types = {
            conversation: msg.message.conversation,
            imageMessage: (_a = msg.message.imageMessage) === null || _a === void 0 ? void 0 : _a.caption,
            videoMessage: (_b = msg.message.videoMessage) === null || _b === void 0 ? void 0 : _b.caption,
            extendedTextMessage: (_c = msg.message.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text,
            buttonsResponseMessage: (_d = msg.message.buttonsResponseMessage) === null || _d === void 0 ? void 0 : _d.selectedDisplayText,
            listResponseMessage: ((_e = msg.message.listResponseMessage) === null || _e === void 0 ? void 0 : _e.title) ||
                ((_g = (_f = msg.message.listResponseMessage) === null || _f === void 0 ? void 0 : _f.singleSelectReply) === null || _g === void 0 ? void 0 : _g.selectedRowId),
            templateButtonReplyMessage: (_j = (_h = msg.message) === null || _h === void 0 ? void 0 : _h.templateButtonReplyMessage) === null || _j === void 0 ? void 0 : _j.selectedId,
            messageContextInfo: ((_k = msg.message.buttonsResponseMessage) === null || _k === void 0 ? void 0 : _k.selectedButtonId) ||
                ((_l = msg.message.listResponseMessage) === null || _l === void 0 ? void 0 : _l.title),
            buttonsMessage: getBodyButton(msg) || ((_m = msg.message.listResponseMessage) === null || _m === void 0 ? void 0 : _m.title),
            stickerMessage: "sticker",
            contactMessage: (_p = (_o = msg.message) === null || _o === void 0 ? void 0 : _o.contactMessage) === null || _p === void 0 ? void 0 : _p.vcard,
            contactsArrayMessage: "varios contatos",
            // locationMessage: `Latitude: ${msg.message.locationMessage?.degreesLatitude} - Longitude: ${msg.message.locationMessage?.degreesLongitude}`,
            locationMessage: msgLocation((_r = (_q = msg.message) === null || _q === void 0 ? void 0 : _q.locationMessage) === null || _r === void 0 ? void 0 : _r.jpegThumbnail, (_t = (_s = msg.message) === null || _s === void 0 ? void 0 : _s.locationMessage) === null || _t === void 0 ? void 0 : _t.degreesLatitude, (_v = (_u = msg.message) === null || _u === void 0 ? void 0 : _u.locationMessage) === null || _v === void 0 ? void 0 : _v.degreesLongitude),
            liveLocationMessage: `Latitude: ${(_w = msg.message.liveLocationMessage) === null || _w === void 0 ? void 0 : _w.degreesLatitude} - Longitude: ${(_x = msg.message.liveLocationMessage) === null || _x === void 0 ? void 0 : _x.degreesLongitude}`,
            documentMessage: (_y = msg.message.documentMessage) === null || _y === void 0 ? void 0 : _y.title,
            audioMessage: "Áudio",
            listMessage: getBodyButton(msg) || ((_z = msg.message.listResponseMessage) === null || _z === void 0 ? void 0 : _z.title),
            viewOnceMessage: getBodyButton(msg),
            reactionMessage: ((_0 = msg.message.reactionMessage) === null || _0 === void 0 ? void 0 : _0.text) || "reaction"
        };
        const objKey = Object.keys(types).find(key => key === type);
        if (!objKey) {
            logger_1.logger.warn(`#### Nao achou o type 152: ${type}
${JSON.stringify(msg)}`);
            Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, type });
            Sentry.captureException(new Error("Novo Tipo de Mensagem em getTypeMessage"));
        }
        return types[type];
    }
    catch (error) {
        Sentry.setExtra("Error getTypeMessage", { msg, BodyMsg: msg.message });
        Sentry.captureException(error);
        console.log(error);
    }
};
exports.getBodyMessage = getBodyMessage;
const getQuotedMessage = (msg) => {
    var _a, _b, _c;
    const body = (0, baileys_1.extractMessageContent)(msg.message)[Object.keys(msg === null || msg === void 0 ? void 0 : msg.message).values().next().value];
    if (!((_a = body === null || body === void 0 ? void 0 : body.contextInfo) === null || _a === void 0 ? void 0 : _a.quotedMessage))
        return;
    const quoted = (0, baileys_1.extractMessageContent)((_b = body === null || body === void 0 ? void 0 : body.contextInfo) === null || _b === void 0 ? void 0 : _b.quotedMessage[Object.keys((_c = body === null || body === void 0 ? void 0 : body.contextInfo) === null || _c === void 0 ? void 0 : _c.quotedMessage).values().next().value]);
    return quoted;
};
exports.getQuotedMessage = getQuotedMessage;
const getQuotedMessageId = (msg) => {
    var _a, _b, _c, _d, _e;
    const body = (0, baileys_1.extractMessageContent)(msg.message)[Object.keys(msg === null || msg === void 0 ? void 0 : msg.message).values().next().value];
    const reaction = ((_a = msg === null || msg === void 0 ? void 0 : msg.message) === null || _a === void 0 ? void 0 : _a.reactionMessage)
        ? (_d = (_c = (_b = msg === null || msg === void 0 ? void 0 : msg.message) === null || _b === void 0 ? void 0 : _b.reactionMessage) === null || _c === void 0 ? void 0 : _c.key) === null || _d === void 0 ? void 0 : _d.id
        : "";
    return reaction || ((_e = body === null || body === void 0 ? void 0 : body.contextInfo) === null || _e === void 0 ? void 0 : _e.stanzaId);
};
exports.getQuotedMessageId = getQuotedMessageId;
const getMeSocket = (wbot) => {
    return {
        id: (0, baileys_1.jidNormalizedUser)(wbot.user.id),
        name: wbot.user.name
    };
};
const getSenderMessage = (msg, wbot) => {
    const me = getMeSocket(wbot);
    if (msg.key.fromMe)
        return me.id;
    const senderId = msg.participant || msg.key.participant || msg.key.remoteJid || undefined;
    return senderId && (0, baileys_1.jidNormalizedUser)(senderId);
};
const getContactMessage = (msg, wbot) => __awaiter(void 0, void 0, void 0, function* () {
    const isGroup = msg.key.remoteJid.includes("g.us");
    const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
    return isGroup
        ? {
            id: getSenderMessage(msg, wbot),
            name: msg.pushName
        }
        : {
            id: msg.key.remoteJid,
            name: msg.key.fromMe ? rawNumber : msg.pushName
        };
});
const downloadMedia = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
    const mineType = ((_d = msg.message) === null || _d === void 0 ? void 0 : _d.imageMessage) ||
        ((_e = msg.message) === null || _e === void 0 ? void 0 : _e.audioMessage) ||
        ((_f = msg.message) === null || _f === void 0 ? void 0 : _f.videoMessage) ||
        ((_g = msg.message) === null || _g === void 0 ? void 0 : _g.stickerMessage) ||
        ((_h = msg.message) === null || _h === void 0 ? void 0 : _h.documentMessage) ||
        ((_m = (_l = (_k = (_j = msg.message) === null || _j === void 0 ? void 0 : _j.extendedTextMessage) === null || _k === void 0 ? void 0 : _k.contextInfo) === null || _l === void 0 ? void 0 : _l.quotedMessage) === null || _m === void 0 ? void 0 : _m.imageMessage);
    // eslint-disable-next-line no-nested-ternary
    const messageType = ((_o = msg.message) === null || _o === void 0 ? void 0 : _o.documentMessage)
        ? "document"
        : mineType.mimetype.split("/")[0].replace("application", "document")
            ? mineType.mimetype
                .split("/")[0]
                .replace("application", "document")
            : mineType.mimetype.split("/")[0];
    let stream;
    let contDownload = 0;
    while (contDownload < 10 && !stream) {
        try {
            // eslint-disable-next-line no-await-in-loop
            stream = yield (0, baileys_1.downloadContentFromMessage)(msg.message.audioMessage ||
                msg.message.videoMessage ||
                msg.message.documentMessage ||
                msg.message.imageMessage ||
                msg.message.stickerMessage ||
                ((_p = msg.message.extendedTextMessage) === null || _p === void 0 ? void 0 : _p.contextInfo.quotedMessage.imageMessage) ||
                ((_r = (_q = msg.message) === null || _q === void 0 ? void 0 : _q.buttonsMessage) === null || _r === void 0 ? void 0 : _r.imageMessage) ||
                ((_u = (_t = (_s = msg.message) === null || _s === void 0 ? void 0 : _s.templateMessage) === null || _t === void 0 ? void 0 : _t.fourRowTemplate) === null || _u === void 0 ? void 0 : _u.imageMessage) ||
                ((_x = (_w = (_v = msg.message) === null || _v === void 0 ? void 0 : _v.templateMessage) === null || _w === void 0 ? void 0 : _w.hydratedTemplate) === null || _x === void 0 ? void 0 : _x.imageMessage) ||
                ((_0 = (_z = (_y = msg.message) === null || _y === void 0 ? void 0 : _y.templateMessage) === null || _z === void 0 ? void 0 : _z.hydratedFourRowTemplate) === null || _0 === void 0 ? void 0 : _0.imageMessage) ||
                ((_3 = (_2 = (_1 = msg.message) === null || _1 === void 0 ? void 0 : _1.interactiveMessage) === null || _2 === void 0 ? void 0 : _2.header) === null || _3 === void 0 ? void 0 : _3.imageMessage), messageType);
        }
        catch (error) {
            // eslint-disable-next-line no-plusplus
            contDownload++;
            // eslint-disable-next-line no-await-in-loop, no-loop-func
            yield new Promise(resolve => setTimeout(resolve, 1000 * contDownload * 2));
            logger_1.logger.warn(`>>>> erro ${contDownload} de baixar o arquivo ${msg === null || msg === void 0 ? void 0 : msg.key.id}`);
        }
    }
    let buffer = Buffer.from([]);
    // eslint-disable-next-line no-restricted-syntax
    try {
        try {
            // eslint-disable-next-line no-restricted-syntax
            for (var _6 = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a;) {
                _c = stream_1_1.value;
                _6 = false;
                try {
                    const chunk = _c;
                    buffer = Buffer.concat([buffer, chunk]);
                }
                finally {
                    _6 = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_6 && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    catch (error) {
        return { data: "error", mimetype: "", filename: "" };
    }
    if (!buffer) {
        Sentry.setExtra("ERR_WAPP_DOWNLOAD_MEDIA", { msg });
        Sentry.captureException(new Error("ERR_WAPP_DOWNLOAD_MEDIA"));
        throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
    }
    let filename = ((_5 = (_4 = msg.message) === null || _4 === void 0 ? void 0 : _4.documentMessage) === null || _5 === void 0 ? void 0 : _5.fileName) || "";
    if (!filename) {
        const ext = mineType.mimetype.split("/")[1].split(";")[0];
        filename = `${new Date().getTime()}.${ext}`;
    }
    const media = {
        data: buffer,
        mimetype: mineType.mimetype,
        filename
    };
    return media;
});
const verifyContact = (msgContact, wbot) => __awaiter(void 0, void 0, void 0, function* () {
    let profilePicUrl;
    try {
        profilePicUrl = yield wbot.profilePictureUrl(msgContact.id);
    }
    catch (_7) {
        profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
    }
    const contactData = {
        name: (msgContact === null || msgContact === void 0 ? void 0 : msgContact.name) || msgContact.id.replace(/\D/g, ""),
        number: msgContact.id.replace(/\D/g, ""),
        profilePicUrl,
        isGroup: msgContact.id.includes("g.us")
    };
    const contact = (0, CreateOrUpdateContactService_1.default)(contactData);
    return contact;
});
const verifyQuotedMessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (!msg)
        return null;
    const quoted = (0, exports.getQuotedMessageId)(msg);
    if (!quoted)
        return null;
    const quotedMsg = yield Message_1.default.findOne({
        where: { id: quoted }
    });
    if (!quotedMsg)
        return null;
    return quotedMsg;
});
const verifyMediaMessage = (msg, ticket, contact) => __awaiter(void 0, void 0, void 0, function* () {
    const quotedMsg = yield verifyQuotedMessage(msg);
    const media = yield downloadMedia(msg);
    if (!media) {
        throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
    }
    if (!media.filename) {
        const ext = media.mimetype.split("/")[1].split(";")[0];
        media.filename = `${new Date().getTime()}.${ext}`;
    }
    try {
        yield writeFileAsync((0, path_1.join)(__dirname, "..", "..", "..", "public", media.filename), media.data, "base64");
    }
    catch (err) {
        Sentry.captureException(err);
        logger_1.logger.error(err);
    }
    const body = (0, exports.getBodyMessage)(msg);
    const messageData = {
        id: msg.key.id,
        ticketId: ticket.id,
        contactId: msg.key.fromMe ? undefined : contact.id,
        body: body || media.filename,
        fromMe: msg.key.fromMe,
        read: msg.key.fromMe,
        mediaUrl: media.filename,
        mediaType: media.mimetype.split("/")[0],
        quotedMsgId: quotedMsg === null || quotedMsg === void 0 ? void 0 : quotedMsg.id,
        ack: msg.status,
        remoteJid: msg.key.remoteJid,
        participant: msg.key.participant,
        dataJson: JSON.stringify(msg)
    };
    yield ticket.update({
        lastMessage: body || media.filename
    });
    const newMessage = yield (0, CreateMessageService_1.default)({ messageData });
    return newMessage;
});
const verifyMessage = (msg, ticket, contact) => __awaiter(void 0, void 0, void 0, function* () {
    const quotedMsg = yield verifyQuotedMessage(msg);
    const body = (0, exports.getBodyMessage)(msg);
    const messageData = {
        id: msg.key.id,
        ticketId: ticket.id,
        contactId: msg.key.fromMe ? undefined : contact.id,
        body,
        fromMe: msg.key.fromMe,
        mediaType: getTypeMessage(msg),
        read: msg.key.fromMe,
        quotedMsgId: quotedMsg === null || quotedMsg === void 0 ? void 0 : quotedMsg.id,
        ack: msg.status,
        remoteJid: msg.key.remoteJid,
        participant: msg.key.participant,
        dataJson: JSON.stringify(msg)
    };
    yield ticket.update({
        lastMessage: body
    });
    return (0, CreateMessageService_1.default)({ messageData });
});
exports.verifyMessage = verifyMessage;
const isValidMsg = (msg) => {
    if (msg.key.remoteJid === "status@broadcast")
        return false;
    try {
        const msgType = getTypeMessage(msg);
        if (!msgType) {
            return;
        }
        const ifType = msgType === "conversation" ||
            msgType === "extendedTextMessage" ||
            msgType === "audioMessage" ||
            msgType === "videoMessage" ||
            msgType === "imageMessage" ||
            msgType === "documentMessage" ||
            msgType === "stickerMessage" ||
            msgType === "buttonsResponseMessage" ||
            msgType === "buttonsMessage" ||
            msgType === "messageContextInfo" ||
            msgType === "locationMessage" ||
            msgType === "liveLocationMessage" ||
            msgType === "contactMessage" ||
            msgType === "voiceMessage" ||
            msgType === "mediaMessage" ||
            msgType === "contactsArrayMessage" ||
            msgType === "reactionMessage" ||
            msgType === "ephemeralMessage" ||
            msgType === "protocolMessage" ||
            msgType === "listResponseMessage" ||
            msgType === "listMessage" ||
            msgType === "viewOnceMessage";
        if (!ifType) {
            logger_1.logger.warn(`#### Nao achou o type em isValidMsg: ${msgType}
${JSON.stringify(msg === null || msg === void 0 ? void 0 : msg.message)}`);
            Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, msgType });
            Sentry.captureException(new Error("Novo Tipo de Mensagem em isValidMsg"));
        }
        return !!ifType;
    }
    catch (error) {
        Sentry.setExtra("Error isValidMsg", { msg });
        Sentry.captureException(error);
    }
};
const verifyQueue = (wbot, msg, ticket, contact) => __awaiter(void 0, void 0, void 0, function* () {
    var _8, _9, _10, _11;
    const { queues, greetingMessage } = yield (0, ShowWhatsAppService_1.default)(wbot.id);
    if (queues.length === 1) {
        yield (0, UpdateTicketService_1.default)({
            ticketData: { queueId: queues[0].id },
            ticketId: ticket.id
        });
        return;
    }
    const selectedOption = ((_9 = (_8 = msg === null || msg === void 0 ? void 0 : msg.message) === null || _8 === void 0 ? void 0 : _8.buttonsResponseMessage) === null || _9 === void 0 ? void 0 : _9.selectedButtonId) ||
        ((_11 = (_10 = msg === null || msg === void 0 ? void 0 : msg.message) === null || _10 === void 0 ? void 0 : _10.listResponseMessage) === null || _11 === void 0 ? void 0 : _11.singleSelectReply.selectedRowId) ||
        (0, exports.getBodyMessage)(msg);
    const choosenQueue = queues[+selectedOption - 1];
    const buttonActive = yield Setting_1.default.findOne({
        where: {
            key: "chatBotType"
        }
    });
    const botText = () => __awaiter(void 0, void 0, void 0, function* () {
        if (choosenQueue) {
            yield (0, UpdateTicketService_1.default)({
                ticketData: { queueId: choosenQueue.id },
                ticketId: ticket.id
            });
            if (choosenQueue.chatbots.length > 0) {
                let options = "";
                choosenQueue.chatbots.forEach((chatbot, index) => {
                    options += `*${index + 1}* - ${chatbot.name}\n`;
                });
                const body = (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}\n\n${options}\n*#* Voltar para o menu principal`, contact);
                const sentMessage = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: body
                });
                yield (0, exports.verifyMessage)(sentMessage, ticket, contact);
            }
            if (!choosenQueue.chatbots.length) {
                const body = (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}`, contact);
                const sentMessage = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: body
                });
                yield (0, exports.verifyMessage)(sentMessage, ticket, contact);
            }
        }
        else {
            let options = "";
            queues.forEach((queue, index) => {
                options += `*${index + 1}* - ${queue.name}\n`;
            });
            const body = (0, Mustache_1.default)(`\u200e${greetingMessage}\n\n${options}`, contact);
            const debouncedSentMessage = (0, Debounce_1.debounce)(() => __awaiter(void 0, void 0, void 0, function* () {
                const sentMessage = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: body
                });
                (0, exports.verifyMessage)(sentMessage, ticket, contact);
            }), 3000, ticket.id);
            debouncedSentMessage();
        }
    });
    const botButton = () => __awaiter(void 0, void 0, void 0, function* () {
        if (choosenQueue) {
            yield (0, UpdateTicketService_1.default)({
                ticketData: { queueId: choosenQueue.id },
                ticketId: ticket.id
            });
            if (choosenQueue.chatbots.length > 0) {
                const buttons = [];
                choosenQueue.chatbots.forEach((queue, index) => {
                    buttons.push({
                        buttonId: `${index + 1}`,
                        buttonText: { displayText: queue.name },
                        type: 1
                    });
                });
                const buttonMessage = {
                    text: (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}`, contact),
                    buttons,
                    headerType: 4
                };
                const sendMsg = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, buttonMessage);
                yield (0, exports.verifyMessage)(sendMsg, ticket, contact);
            }
            if (!choosenQueue.chatbots.length) {
                const body = (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}`, contact);
                const sentMessage = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: body
                });
                yield (0, exports.verifyMessage)(sentMessage, ticket, contact);
            }
        }
        else {
            const buttons = [];
            queues.forEach((queue, index) => {
                buttons.push({
                    buttonId: `${index + 1}`,
                    buttonText: { displayText: queue.name },
                    type: 4
                });
            });
            const buttonMessage = {
                text: (0, Mustache_1.default)(`\u200e${greetingMessage}`, contact),
                buttons,
                headerType: 4
            };
            const sendMsg = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, buttonMessage);
            yield (0, exports.verifyMessage)(sendMsg, ticket, contact);
        }
    });
    const botList = () => __awaiter(void 0, void 0, void 0, function* () {
        if (choosenQueue) {
            yield (0, UpdateTicketService_1.default)({
                ticketData: { queueId: choosenQueue.id },
                ticketId: ticket.id
            });
            if (choosenQueue.chatbots.length > 0) {
                const sectionsRows = [];
                choosenQueue.chatbots.forEach((queue, index) => {
                    sectionsRows.push({
                        title: queue.name,
                        rowId: `${index + 1}`
                    });
                });
                const sections = [
                    {
                        title: "Menu",
                        rows: sectionsRows
                    }
                ];
                const listMessage = {
                    text: (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}`, contact),
                    buttonText: "Escolha uma opção",
                    sections
                };
                const sendMsg = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, listMessage);
                yield (0, exports.verifyMessage)(sendMsg, ticket, contact);
            }
            if (!choosenQueue.chatbots.length) {
                const body = (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}`, contact);
                const sentMessage = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                    text: body
                });
                yield (0, exports.verifyMessage)(sentMessage, ticket, contact);
            }
        }
        else {
            const sectionsRows = [];
            queues.forEach((queue, index) => {
                sectionsRows.push({
                    title: queue.name,
                    rowId: `${index + 1}`
                });
            });
            const sections = [
                {
                    title: "Menu",
                    rows: sectionsRows
                }
            ];
            const listMessage = {
                text: (0, Mustache_1.default)(`\u200e${greetingMessage}`, contact),
                buttonText: "Escolha uma opção",
                sections
            };
            const sendMsg = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, listMessage);
            yield (0, exports.verifyMessage)(sendMsg, ticket, contact);
        }
    });
    if (buttonActive.value === "text") {
        return botText();
    }
    if (buttonActive.value === "button" && queues.length > 4) {
        return botText();
    }
    if (buttonActive.value === "button" && queues.length <= 4) {
        return botButton();
    }
    if (buttonActive.value === "list") {
        return botList();
    }
});
const handleMessage = (msg, wbot) => __awaiter(void 0, void 0, void 0, function* () {
    var _12, _13, _14, _15, _16, _17, _18, _19, _20;
    if (!isValidMsg(msg))
        return;
    try {
        let msgContact;
        let groupContact;
        const isGroup = (_12 = msg.key.remoteJid) === null || _12 === void 0 ? void 0 : _12.endsWith("@g.us");
        const msgIsGroupBlock = yield Setting_1.default.findOne({
            where: { key: "CheckMsgIsGroup" }
        });
        const bodyMessage = (0, exports.getBodyMessage)(msg);
        const msgType = getTypeMessage(msg);
        if (msgType === "protocolMessage")
            return; // Tratar isso no futuro para excluir msgs se vor REVOKE
        const hasMedia = ((_13 = msg.message) === null || _13 === void 0 ? void 0 : _13.audioMessage) ||
            ((_14 = msg.message) === null || _14 === void 0 ? void 0 : _14.imageMessage) ||
            ((_15 = msg.message) === null || _15 === void 0 ? void 0 : _15.videoMessage) ||
            ((_16 = msg.message) === null || _16 === void 0 ? void 0 : _16.documentMessage) ||
            msg.message.stickerMessage ||
            ((_20 = (_19 = (_18 = (_17 = msg.message) === null || _17 === void 0 ? void 0 : _17.extendedTextMessage) === null || _18 === void 0 ? void 0 : _18.contextInfo) === null || _19 === void 0 ? void 0 : _19.quotedMessage) === null || _20 === void 0 ? void 0 : _20.imageMessage);
        if (msg.key.fromMe) {
            if (/\u200e/.test(bodyMessage))
                return;
            if (!hasMedia &&
                msgType !== "conversation" &&
                msgType !== "extendedTextMessage" &&
                msgType !== "vcard" &&
                msgType !== "reactionMessage" &&
                msgType !== "ephemeralMessage" &&
                msgType !== "protocolMessage" &&
                msgType !== "viewOnceMessage")
                return;
            msgContact = yield getContactMessage(msg, wbot);
        }
        else {
            msgContact = yield getContactMessage(msg, wbot);
        }
        if ((msgIsGroupBlock === null || msgIsGroupBlock === void 0 ? void 0 : msgIsGroupBlock.value) === "enabled" && isGroup)
            return;
        if (isGroup) {
            const grupoMeta = yield wbot.groupMetadata(msg.key.remoteJid);
            const msgGroupContact = {
                id: grupoMeta.id,
                name: grupoMeta.subject
            };
            groupContact = yield verifyContact(msgGroupContact, wbot);
        }
        const whatsapp = yield (0, ShowWhatsAppService_1.default)(wbot.id);
        const count = wbot.store.chats.get(msg.key.remoteJid || msg.key.participant);
        const unreadMessages = msg.key.fromMe ? 0 : (count === null || count === void 0 ? void 0 : count.unreadCount) || 1;
        const contact = yield verifyContact(msgContact, wbot);
        if (unreadMessages === 0 &&
            whatsapp.farewellMessage &&
            (0, Mustache_1.default)(whatsapp.farewellMessage, contact) === bodyMessage)
            return;
        const ticket = yield (0, FindOrCreateTicketService_1.default)({
            contact,
            whatsappId: wbot.id,
            unreadMessages,
            groupContact,
            channel: "whatsapp"
        });
        if (hasMedia) {
            yield verifyMediaMessage(msg, ticket, contact);
        }
        else {
            yield (0, exports.verifyMessage)(msg, ticket, contact);
        }
        const checkExpedient = yield (0, hourExpedient_1.default)();
        if (checkExpedient) {
            if (!ticket.queue &&
                !isGroup &&
                !msg.key.fromMe &&
                !ticket.userId &&
                whatsapp.queues.length >= 1) {
                yield verifyQueue(wbot, msg, ticket, contact);
            }
            if (ticket.queue && ticket.queueId) {
                if (!ticket.user) {
                    yield (0, ChatBotListener_1.sayChatbot)(ticket.queueId, wbot, ticket, contact, msg);
                }
            }
        }
        else {
            const getLastMessageFromMe = yield Message_1.default.findOne({
                where: {
                    ticketId: ticket.id,
                    fromMe: true
                },
                order: [["createdAt", "DESC"]]
            });
            if ((getLastMessageFromMe === null || getLastMessageFromMe === void 0 ? void 0 : getLastMessageFromMe.body) ===
                (0, Mustache_1.default)(`\u200e${whatsapp.outOfWorkMessage}`, contact))
                return;
            const body = (0, Mustache_1.default)(`\u200e${whatsapp.outOfWorkMessage}`, contact);
            const sentMessage = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
                text: body
            });
            yield (0, exports.verifyMessage)(sentMessage, ticket, contact);
        }
    }
    catch (err) {
        console.log(err);
        Sentry.captureException(err);
        logger_1.logger.error(`Error handling whatsapp message: Err: ${err}`);
    }
});
exports.handleMessage = handleMessage;
const handleMsgAck = (msg, chat) => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise(r => setTimeout(r, 500));
    const io = (0, socket_1.getIO)();
    try {
        const messageToUpdate = yield Message_1.default.findByPk(msg.key.id, {
            include: [
                "contact",
                {
                    model: Message_1.default,
                    as: "quotedMsg",
                    include: ["contact"]
                }
            ]
        });
        if (!messageToUpdate)
            return;
        yield messageToUpdate.update({ ack: chat });
        io.to(messageToUpdate.ticketId.toString()).emit("appMessage", {
            action: "update",
            message: messageToUpdate
        });
    }
    catch (err) {
        Sentry.captureException(err);
        logger_1.logger.error(`Error handling message ack. Err: ${err}`);
    }
});
const filterMessages = (msg) => {
    var _a;
    if ((_a = msg.message) === null || _a === void 0 ? void 0 : _a.protocolMessage)
        return false;
    if ([
        baileys_1.WAMessageStubType.REVOKE,
        baileys_1.WAMessageStubType.E2E_DEVICE_CHANGED,
        baileys_1.WAMessageStubType.E2E_IDENTITY_CHANGED,
        baileys_1.WAMessageStubType.CIPHERTEXT
    ].includes(msg.messageStubType))
        return false;
    return true;
};
const wbotMessageListener = (wbot) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        wbot.ev.on("messages.upsert", (messageUpsert) => __awaiter(void 0, void 0, void 0, function* () {
            const messages = messageUpsert.messages
                .filter(filterMessages)
                .map(msg => msg);
            if (!messages)
                return;
            messages.forEach((message) => __awaiter(void 0, void 0, void 0, function* () {
                if (wbot.type === "md" &&
                    !message.key.fromMe &&
                    messageUpsert.type === "notify") {
                    wbot.readMessages([message.key]);
                }
                // console.log(JSON.stringify(message));
                handleMessage(message, wbot);
            }));
        }));
        wbot.ev.on("messages.update", (messageUpdate) => {
            if (messageUpdate.length === 0)
                return;
            messageUpdate.forEach((message) => __awaiter(void 0, void 0, void 0, function* () {
                handleMsgAck(message, message.update.status);
            }));
        });
    }
    catch (error) {
        Sentry.captureException(error);
        logger_1.logger.error(`Error handling wbot message listener. Err: ${error}`);
    }
});
exports.wbotMessageListener = wbotMessageListener;
