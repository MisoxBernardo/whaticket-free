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
const sequelize_1 = require("sequelize");
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const ListChatBotService = () => __awaiter(void 0, void 0, void 0, function* () {
    const chatBot = yield Chatbot_1.default.findAll({
        where: {
            queueId: {
                [sequelize_1.Op.or]: [null]
            }
        },
        order: [["id", "ASC"]]
    });
    return chatBot;
});
exports.default = ListChatBotService;
