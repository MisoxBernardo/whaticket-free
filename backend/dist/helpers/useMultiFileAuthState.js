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
exports.useMultiFileAuthState = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const BaileysSessions_1 = __importDefault(require("../models/BaileysSessions"));
const useMultiFileAuthState = (whatsapp) => __awaiter(void 0, void 0, void 0, function* () {
    const writeData = (data, file) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const existing = yield BaileysSessions_1.default.findOne({
                where: {
                    whatsappId: whatsapp.id,
                    name: file
                }
            });
            if (existing) {
                yield existing.update({
                    value: JSON.stringify(data, baileys_1.BufferJSON.replacer)
                });
            }
            else {
                yield BaileysSessions_1.default.create({
                    whatsappId: whatsapp.id,
                    value: JSON.stringify(data, baileys_1.BufferJSON.replacer),
                    name: file
                });
            }
        }
        catch (error) {
            console.log("writeData error", error);
            return null;
        }
    });
    const readData = (file) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = yield BaileysSessions_1.default.findOne({
                where: {
                    whatsappId: whatsapp.id,
                    name: file
                }
            });
            if (data && data.value !== null) {
                return JSON.parse(JSON.stringify(data.value), baileys_1.BufferJSON.reviver);
            }
            return null;
        }
        catch (error) {
            console.log("Read data error", error);
            return null;
        }
    });
    const removeData = (file) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield BaileysSessions_1.default.destroy({
                where: {
                    whatsappId: whatsapp.id,
                    name: file
                }
            });
        }
        catch (error) {
            console.log("removeData", error);
        }
    });
    const creds = (yield readData("creds")) || (0, baileys_1.initAuthCreds)();
    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => __awaiter(void 0, void 0, void 0, function* () {
                    const data = {};
                    yield Promise.all(ids.map((id) => __awaiter(void 0, void 0, void 0, function* () {
                        let value = yield readData(`${type}-${id}`);
                        if (type === "app-state-sync-key") {
                            value = baileys_1.proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    })));
                    return data;
                }),
                set: (data) => __awaiter(void 0, void 0, void 0, function* () {
                    const tasks = [];
                    // eslint-disable-next-line no-restricted-syntax, guard-for-in
                    for (const category in data) {
                        // eslint-disable-next-line no-restricted-syntax, guard-for-in
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const file = `${category}-${id}`;
                            tasks.push(value ? writeData(value, file) : removeData(file));
                        }
                    }
                    yield Promise.all(tasks);
                })
            }
        },
        saveCreds: () => {
            return writeData(creds, "creds");
        }
    };
});
exports.useMultiFileAuthState = useMultiFileAuthState;
