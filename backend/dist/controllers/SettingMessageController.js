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
exports.update = exports.store = exports.show = exports.index = void 0;
const socket_1 = require("../libs/socket");
const AppError_1 = __importDefault(require("../errors/AppError"));
const UpdateSettingService_1 = __importDefault(require("../services/SettingMensageServices/UpdateSettingService"));
const ListSettingsService_1 = __importDefault(require("../services/SettingMensageServices/ListSettingsService"));
const CreateSettingService_1 = __importDefault(require("../services/SettingMensageServices/CreateSettingService"));
const ShowSettingsService_1 = __importDefault(require("../services/SettingMensageServices/ShowSettingsService"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const settings = yield (0, ListSettingsService_1.default)();
    return res.status(200).json(settings);
});
exports.index = index;
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { whatsappId } = req.params;
    console.log(whatsappId);
    const settings = yield (0, ShowSettingsService_1.default)(whatsappId);
    return res.status(200).json(settings);
});
exports.show = show;
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { contact, limit, minutes, optOut, photo, random, seconds, whatsappId } = req.body;
    try {
        console.log(req.body);
        const chatbot = yield (0, CreateSettingService_1.default)({
            contact,
            limit,
            minutes,
            optOut,
            photo,
            random,
            seconds,
            whatsappId
        });
        const io = (0, socket_1.getIO)();
        io.emit("settings", {
            action: "update",
            chatbot
        });
        return res.status(200).json(chatbot);
    }
    catch (error) {
        throw new AppError_1.default(error.message);
    }
});
exports.store = store;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const setting = yield (0, UpdateSettingService_1.default)(req.body);
    return res.status(200).json(setting);
});
exports.update = update;
