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
const ShowChatBotByChatbotIdServices = (chatbotId) => __awaiter(void 0, void 0, void 0, function* () {
    const queue = yield Chatbot_1.default.findOne({
        where: { chatbotId },
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
    if (!queue) {
        throw new AppError_1.default("ERR_CHATBOT_NOT_FOUND_SERVICE", 404);
    }
    return queue;
});
exports.default = ShowChatBotByChatbotIdServices;
