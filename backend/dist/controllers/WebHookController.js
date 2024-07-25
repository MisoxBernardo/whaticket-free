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
Object.defineProperty(exports, "__esModule", { value: true });
exports.webHook = exports.index = void 0;
const facebookMessageListener_1 = require("../services/FacebookServices/facebookMessageListener");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "whaticket";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            return res.status(200).send(challenge);
        }
    }
    return res.status(403).json({
        message: "Forbidden"
    });
});
exports.index = index;
const webHook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { body } = req;
    if (body.object === "page" || body.object === "instagram") {
        let channel;
        if (body.object === "page") {
            channel = "facebook";
        }
        else {
            channel = "instagram";
        }
        console.log(body);
        (_a = body.entry) === null || _a === void 0 ? void 0 : _a.forEach((entry) => {
            var _a;
            (_a = entry.messaging) === null || _a === void 0 ? void 0 : _a.forEach((data) => {
                (0, facebookMessageListener_1.handleMessage)(data, channel);
            });
        });
        return res.status(200).json({
            message: "EVENT_RECEIVED"
        });
    }
    return res.status(404).json({
        message: body
    });
});
exports.webHook = webHook;
