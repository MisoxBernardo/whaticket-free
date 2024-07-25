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
const ShowChatBotServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const queue = yield Chatbot_1.default.findOne({
        where: {
            id
        },
        order: [
            [{ model: Chatbot_1.default, as: "mainChatbot" }, "id", "ASC"],
            [{ model: Chatbot_1.default, as: "options" }, "id", "ASC"],
            ["id", "asc"]
        ],
        include: [
            {
                model: Chatbot_1.default,
                as: "mainChatbot"
            },
            {
                model: Chatbot_1.default,
                as: "options"
            }
        ]
    });
    if (!queue) {
        throw new AppError_1.default("Chatbot not found", 404);
    }
    return queue;
});
exports.default = ShowChatBotServices;
