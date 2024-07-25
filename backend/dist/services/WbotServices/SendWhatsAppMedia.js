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
exports.processAudioFile = exports.processAudio = void 0;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const GetTicketWbot_1 = __importDefault(require("../../helpers/GetTicketWbot"));
const publicFolder = path_1.default.resolve(__dirname, "..", "..", "..", "public");
const processAudio = (audio) => __awaiter(void 0, void 0, void 0, function* () {
    const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`${ffmpeg_1.default.path} -i ${audio} -vn -ab 128k -ar 44100 -f ipod ${outputAudio} -y`, (error, _stdout, _stderr) => {
            if (error)
                reject(error);
            fs_1.default.unlinkSync(audio);
            resolve(outputAudio);
        });
    });
});
exports.processAudio = processAudio;
const processAudioFile = (audio) => __awaiter(void 0, void 0, void 0, function* () {
    const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`${ffmpeg_1.default.path} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio}`, (error, _stdout, _stderr) => {
            if (error)
                reject(error);
            fs_1.default.unlinkSync(audio);
            resolve(outputAudio);
        });
    });
});
exports.processAudioFile = processAudioFile;
const SendWhatsAppMedia = ({ media, ticket, body }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wbot = yield (0, GetTicketWbot_1.default)(ticket);
        const pathMedia = media.path;
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
                const convert = yield (0, exports.processAudio)(media.path);
                options = {
                    audio: fs_1.default.readFileSync(convert),
                    mimetype: typeAudio ? "audio/mp4" : media.mimetype,
                    ptt: true
                };
            }
            else {
                const convert = yield (0, exports.processAudioFile)(media.path);
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
        const sentMessage = yield wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, Object.assign({}, options));
        yield ticket.update({ lastMessage: media.filename });
        return sentMessage;
    }
    catch (err) {
        console.log(err);
        throw new AppError_1.default("ERR_SENDING_WAPP_MSG");
    }
});
exports.default = SendWhatsAppMedia;
