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
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const UpdateChatBotServices = (chatBotId, chatbotData) => __awaiter(void 0, void 0, void 0, function* () {
    const { options } = chatbotData;
    const chatbot = yield Chatbot_1.default.findOne({
        where: { id: chatBotId },
        include: ["options"],
        order: [["id", "asc"]]
    });
    if (!chatbot) {
        throw new AppError_1.default("ERR_NO_CHATBOT_FOUND", 404);
    }
    if (options) {
        yield Promise.all(options.map((bot) => __awaiter(void 0, void 0, void 0, function* () {
            yield Chatbot_1.default.upsert(Object.assign(Object.assign({}, bot), { chatbotId: chatbot.id }));
        })));
        yield Promise.all(chatbot.options.map((oldBot) => __awaiter(void 0, void 0, void 0, function* () {
            const stillExists = options.findIndex(bot => bot.id === oldBot.id);
            if (stillExists === -1) {
                yield Chatbot_1.default.destroy({ where: { id: oldBot.id } });
            }
        })));
    }
    yield chatbot.update(chatbotData);
    yield chatbot.reload({
        include: [
            {
                model: Chatbot_1.default,
                as: "mainChatbot",
                attributes: ["id", "name", "greetingMessage"],
                order: [[{ model: Chatbot_1.default, as: "mainChatbot" }, "id", "ASC"]]
            },
            {
                model: Chatbot_1.default,
                as: "options",
                order: [[{ model: Chatbot_1.default, as: "options" }, "id", "ASC"]],
                attributes: ["id", "name", "greetingMessage"]
            }
        ],
        order: [["id", "asc"]]
    });
    return chatbot;
});
exports.default = UpdateChatBotServices;
