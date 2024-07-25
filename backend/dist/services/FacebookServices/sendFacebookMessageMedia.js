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
const fs_1 = __importDefault(require("fs"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// import formatBody from "../../helpers/Mustache";
const graphAPI_1 = require("./graphAPI");
const typeAttachment = (media) => {
    if (media.mimetype.includes("image")) {
        return "image";
    }
    if (media.mimetype.includes("video")) {
        return "video";
    }
    if (media.mimetype.includes("audio")) {
        return "audio";
    }
    return "file";
};
const sendFacebookMessageMedia = ({ media, ticket, body }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const hasBody = body
        //   ? formatBody(body as string, ticket.contact)
        //   : undefined;
        const type = typeAttachment(media);
        console.log(`Sending ${type} to ${ticket.contact.id}`);
        const sendMessage = yield (0, graphAPI_1.sendAttachment)(ticket.contact.number, fs_1.default.createReadStream(media.path), type);
        yield ticket.update({ lastMessage: body || media.filename });
        fs_1.default.unlinkSync(media.path);
        return sendMessage;
    }
    catch (err) {
        console.log(err);
        throw new AppError_1.default("ERR_SENDING_FACEBOOK_MSG");
    }
});
exports.default = sendFacebookMessageMedia;
