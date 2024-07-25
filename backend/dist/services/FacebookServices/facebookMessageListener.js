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
exports.handleMessage = exports.verifyMessageMedia = exports.verifyMessage = void 0;
const fs_1 = require("fs");
const axios_1 = __importDefault(require("axios"));
const path_1 = require("path");
const CreateOrUpdateContactService_1 = __importDefault(require("../ContactServices/CreateOrUpdateContactService"));
const CreateMessageService_1 = __importDefault(require("../MessageServices/CreateMessageService"));
const FindOrCreateTicketService_1 = __importDefault(require("../TicketServices/FindOrCreateTicketService"));
const graphAPI_1 = require("./graphAPI");
const verifyContact = (msgContact) => __awaiter(void 0, void 0, void 0, function* () {
    const contactData = {
        name: (msgContact === null || msgContact === void 0 ? void 0 : msgContact.name) || `${msgContact.first_name} ${msgContact.last_name}`,
        number: msgContact.id,
        profilePicUrl: msgContact.profile_pic,
        isGroup: false
    };
    const contact = (0, CreateOrUpdateContactService_1.default)(contactData);
    return contact;
});
const verifyMessage = (msg, ticket, contact) => __awaiter(void 0, void 0, void 0, function* () {
    const messageData = {
        id: msg.mid,
        ticketId: ticket.id,
        contactId: msg.is_echo ? undefined : contact.id,
        body: msg.text,
        fromMe: msg.is_echo,
        read: msg.is_echo,
        quotedMsgId: null,
        ack: 2,
        dataJson: JSON.stringify(msg)
    };
    yield (0, CreateMessageService_1.default)({ messageData });
    yield ticket.update({
        lastMessage: msg.text
    });
});
exports.verifyMessage = verifyMessage;
const verifyMessageMedia = (msg, ticket, contact) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield axios_1.default.get(msg.attachments[0].payload.url, {
        responseType: "arraybuffer"
    });
    // eslint-disable-next-line no-eval
    const { fileTypeFromBuffer } = yield eval('import("file-type")');
    const type = yield fileTypeFromBuffer(data);
    const fileName = `${new Date().getTime()}.${type.ext}`;
    (0, fs_1.writeFileSync)((0, path_1.join)(__dirname, "..", "..", "..", "public", fileName), data, "base64");
    const messageData = {
        id: msg.mid,
        ticketId: ticket.id,
        contactId: msg.is_echo ? undefined : contact.id,
        body: msg.text || fileName,
        fromMe: msg.is_echo,
        mediaType: msg.attachments[0].type,
        mediaUrl: fileName,
        read: msg.is_echo,
        quotedMsgId: null,
        ack: 2,
        dataJson: JSON.stringify(msg)
    };
    yield (0, CreateMessageService_1.default)({ messageData });
    console.log(msg);
    yield ticket.update({
        lastMessage: msg.text
    });
});
exports.verifyMessageMedia = verifyMessageMedia;
const handleMessage = (webhookEvent, channel) => __awaiter(void 0, void 0, void 0, function* () {
    if (webhookEvent.message) {
        let msgContact;
        const senderPsid = webhookEvent.sender.id;
        const recipientPsid = webhookEvent.recipient.id;
        const { message } = webhookEvent;
        const fromMe = message.is_echo;
        if (fromMe) {
            if (/\u200e/.test(message.text))
                return;
            msgContact = yield (0, graphAPI_1.getProfile)(recipientPsid);
        }
        else {
            msgContact = yield (0, graphAPI_1.getProfile)(senderPsid);
        }
        const contact = yield verifyContact(msgContact);
        const unreadCount = fromMe ? 0 : 1;
        const ticket = yield (0, FindOrCreateTicketService_1.default)({
            whatsappId: null,
            contact,
            unreadMessages: unreadCount,
            channel
        });
        if (message.attachments) {
            yield (0, exports.verifyMessageMedia)(message, ticket, contact);
        }
        else {
            yield (0, exports.verifyMessage)(message, ticket, contact);
        }
    }
});
exports.handleMessage = handleMessage;
