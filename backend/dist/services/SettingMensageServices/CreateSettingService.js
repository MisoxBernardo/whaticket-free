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
const SettingMessage_1 = __importDefault(require("../../models/SettingMessage"));
const CreateSettingService = (settingsData) => __awaiter(void 0, void 0, void 0, function* () {
    const checkExist = yield SettingMessage_1.default.findOne({
        where: {
            whatsappId: settingsData.whatsappId
        }
    });
    if (checkExist) {
        yield SettingMessage_1.default.update(settingsData, {
            where: {
                whatsappId: settingsData.whatsappId
            }
        });
        const find = yield SettingMessage_1.default.findOne({
            where: {
                whatsappId: settingsData.whatsappId
            }
        });
        return find;
    }
    const settings = yield SettingMessage_1.default.create(settingsData);
    return settings;
});
exports.default = CreateSettingService;
