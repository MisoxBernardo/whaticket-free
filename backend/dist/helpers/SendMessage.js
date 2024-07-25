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
exports.SendMessage = void 0;
const mime_types_1 = __importDefault(require("mime-types"));
const fs_1 = __importDefault(require("fs"));
const GetWhatsappWbot_1 = __importDefault(require("./GetWhatsappWbot"));
const SendWhatsAppMedia_1 = require("../services/WbotServices/SendWhatsAppMedia");
const SendMessage = (whatsapp, messageData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wbot = yield (0, GetWhatsappWbot_1.default)(whatsapp);
        const jid = `${messageData.number}@s.whatsapp.net`;
        let message;
        const body = `\u200e${messageData.body}`;
        console.log("envio de mensagem");
        if (messageData.mediaPath) {
            const media = {
                path: messageData.mediaPath,
                mimetype: mime_types_1.default.lookup(messageData.mediaPath)
            };
            console.log(media);
            const pathMedia = messageData.mediaPath;
            const typeMessage = media.mimetype.split("/")[0];
            let options;
            if (typeMessage === "video") {
                options = {
                    video: fs_1.default.readFileSync(pathMedia),
                    caption: body,
                    fileName: media.originalname
                    // gifPlayback: true
                };
            }
            else if (typeMessage === "audio") {
                const typeAudio = media.originalname.includes("audio-record-site");
                if (typeAudio) {
                    const convert = yield (0, SendWhatsAppMedia_1.processAudio)(media.path);
                    options = {
                        audio: fs_1.default.readFileSync(convert),
                        mimetype: typeAudio ? "audio/mp4" : media.mimetype,
                        ptt: true
                    };
                }
                else {
                    const convert = yield (0, SendWhatsAppMedia_1.processAudioFile)(media.path);
                    options = {
                        audio: fs_1.default.readFileSync(convert),
                        mimetype: typeAudio ? "audio/mp4" : media.mimetype
                    };
                }
            }
            else if (typeMessage === "document") {
                options = {
                    document: fs_1.default.readFileSync(pathMedia),
                    caption: body,
                    fileName: media.originalname,
                    mimetype: media.mimetype
                };
            }
            else if (typeMessage === "application") {
                options = {
                    document: fs_1.default.readFileSync(pathMedia),
                    caption: body,
                    fileName: media.originalname,
                    mimetype: media.mimetype
                };
            }
            else {
                options = {
                    image: fs_1.default.readFileSync(pathMedia),
                    caption: body
                };
            }
            message = yield wbot.sendMessage(jid, Object.assign({}, options));
            console.log(message);
        }
        else {
            console.log(body);
            message = yield wbot.sendMessage(jid, {
                text: body
            });
        }
        return message;
    }
    catch (err) {
        console.log(err);
        throw new Error(err);
    }
});
exports.SendMessage = SendMessage;
