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
exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const socket_1 = require("../libs/socket");
const CreateChatBotServices_1 = __importDefault(require("../services/ChatBotServices/CreateChatBotServices"));
const DeleteChatBotServices_1 = __importDefault(require("../services/ChatBotServices/DeleteChatBotServices"));
const ListChatBotServices_1 = __importDefault(require("../services/ChatBotServices/ListChatBotServices"));
const ShowChatBotServices_1 = __importDefault(require("../services/ChatBotServices/ShowChatBotServices"));
const UpdateChatBotServices_1 = __importDefault(require("../services/ChatBotServices/UpdateChatBotServices"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const queues = yield (0, ListChatBotServices_1.default)();
    return res.status(200).json(queues);
});
exports.index = index;
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, color, greetingMessage } = req.body;
    const chatbot = yield (0, CreateChatBotServices_1.default)({ name, color, greetingMessage });
    const io = (0, socket_1.getIO)();
    io.emit("chatbot", {
        action: "update",
        chatbot
    });
    return res.status(200).json(chatbot);
});
exports.store = store;
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbotId } = req.params;
    const queue = yield (0, ShowChatBotServices_1.default)(chatbotId);
    return res.status(200).json(queue);
});
exports.show = show;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbotId } = req.params;
    const chatbot = yield (0, UpdateChatBotServices_1.default)(chatbotId, req.body);
    const io = (0, socket_1.getIO)();
    io.emit("chatbot", {
        action: "update",
        chatbot
    });
    return res.status(201).json(chatbot);
});
exports.update = update;
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatbotId } = req.params;
    yield (0, DeleteChatBotServices_1.default)(chatbotId);
    const io = (0, socket_1.getIO)();
    io.emit("chatbot", {
        action: "delete",
        chatbotId: +chatbotId
    });
    return res.status(200).send();
});
exports.remove = remove;
