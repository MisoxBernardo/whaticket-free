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
const AppError_1 = __importDefault(require("../../errors/AppError"));
const GetTicketWbot_1 = __importDefault(require("../../helpers/GetTicketWbot"));
const Message_1 = __importDefault(require("../../models/Message"));
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const SendWhatsAppMessage = ({ body, ticket, quotedMsg }) => __awaiter(void 0, void 0, void 0, function* () {
    let options = {};
    const wbot = yield (0, GetTicketWbot_1.default)(ticket);
    const number = `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`;
    if (quotedMsg) {
        const chatMessages = yield Message_1.default.findOne({
            where: {
                id: quotedMsg.id
            }
        });
        const msgFound = JSON.parse(JSON.stringify(chatMessages.dataJson));
        options = {
            quoted: {
                key: msgFound.key,
                message: {
                    extendedTextMessage: msgFound.message.extendedTextMessage
                }
            }
        };
    }
    try {
        const sentMessage = yield wbot.sendMessage(number, {
            text: (0, Mustache_1.default)(body, ticket.contact)
        }, Object.assign({}, options));
        yield ticket.update({ lastMessage: (0, Mustache_1.default)(body, ticket.contact) });
        return sentMessage;
    }
    catch (err) {
        throw new AppError_1.default("ERR_SENDING_WAPP_MSG");
    }
});
exports.default = SendWhatsAppMessage;
