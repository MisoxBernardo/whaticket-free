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
exports.GetWbotMessage = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const GetMessagesService_1 = __importDefault(require("../services/MessageServices/GetMessagesService"));
const GetWbotMessage = (ticket, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const fetchWbotMessagesGradually = () => __awaiter(void 0, void 0, void 0, function* () {
        const msgFound = yield (0, GetMessagesService_1.default)({
            id: messageId
        });
        return msgFound;
    });
    try {
        const msgFound = yield fetchWbotMessagesGradually();
        if (!msgFound) {
            throw new Error("Cannot found message within 100 last messages");
        }
        return msgFound;
    }
    catch (err) {
        console.log(err);
        throw new AppError_1.default("ERR_FETCH_WAPP_MSG");
    }
});
exports.GetWbotMessage = GetWbotMessage;
exports.default = exports.GetWbotMessage;
