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
exports.getProfile = exports.genText = exports.sendAttachment = exports.sendText = exports.markSeen = exports.getAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const formData = new form_data_1.default();
const apiBase = axios_1.default.create({
    baseURL: "https://graph.facebook.com/",
    params: {
        access_token: process.env.PAGE_ACCESS_TOKEN
    }
});
const getAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield axios_1.default.get("https://graph.facebook.com/v6.0/oauth/access_token", {
        params: {
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            grant_type: "client_credentials"
        }
    });
    return data.access_token;
});
exports.getAccessToken = getAccessToken;
const markSeen = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield apiBase.post(`${id}/messages`, {
        recipient: {
            id
        },
        sender_action: "mark_seen"
    });
});
exports.markSeen = markSeen;
const sendText = (id, text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield apiBase.post("/v11.0/me/messages", {
            recipient: {
                id
            },
            message: {
                text: `${text}`
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.sendText = sendText;
const sendAttachment = (id, file, type) => __awaiter(void 0, void 0, void 0, function* () {
    formData.append("recipient", JSON.stringify({
        id
    }));
    formData.append("message", JSON.stringify({
        attachment: {
            type,
            payload: {
                is_reusable: true
            }
        }
    }));
    formData.append("filedata", file);
    try {
        yield apiBase.post("/v11.0/me/messages", formData, {
            headers: formData.getHeaders()
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.sendAttachment = sendAttachment;
const genText = (text) => {
    const response = {
        text
    };
    return response;
};
exports.genText = genText;
const getProfile = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield apiBase.get(id);
        console.log(data);
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getProfile = getProfile;
