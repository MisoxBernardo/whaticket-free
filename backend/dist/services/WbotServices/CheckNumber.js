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
const GetDefaultWhatsApp_1 = __importDefault(require("../../helpers/GetDefaultWhatsApp"));
const wbot_1 = require("../../libs/wbot");
const CheckContactNumber = (number) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const defaultWhatsapp = yield (0, GetDefaultWhatsApp_1.default)();
    const wbot = (0, wbot_1.getWbot)(defaultWhatsapp.id);
    const isGroup = number.endsWith("@g.us");
    let numberArray;
    if (isGroup) {
        const grupoMeta = yield wbot.groupMetadata(number);
        numberArray = [
            {
                jid: grupoMeta.id,
                exists: true
            }
        ];
    }
    else {
        numberArray = yield wbot.onWhatsApp(`${number}@s.whatsapp.net`);
    }
    const isNumberExit = numberArray;
    if (!((_a = isNumberExit[0]) === null || _a === void 0 ? void 0 : _a.exists)) {
        throw new Error("ERR_CHECK_NUMBER");
    }
    return isGroup
        ? number.split("@")[0]
        : isNumberExit[0].jid.replace(/[^\d]/g, "");
});
exports.default = CheckContactNumber;
