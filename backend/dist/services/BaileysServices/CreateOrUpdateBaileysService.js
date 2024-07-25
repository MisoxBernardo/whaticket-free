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
const Baileys_1 = __importDefault(require("../../models/Baileys"));
const createOrUpdateBaileysService = ({ whatsappId, contacts, chats }) => __awaiter(void 0, void 0, void 0, function* () {
    const baileysExists = yield Baileys_1.default.findOne({
        where: { whatsappId }
    });
    if (baileysExists) {
        const getChats = baileysExists.chats
            ? JSON.parse(JSON.stringify(baileysExists.chats))
            : [];
        const getContacts = baileysExists.contacts
            ? JSON.parse(JSON.stringify(baileysExists.contacts))
            : [];
        if (chats) {
            getChats.push(...chats);
            getChats.sort();
            getChats.filter((v, i, a) => a.indexOf(v) === i);
        }
        if (contacts) {
            getContacts.push(...contacts);
            getContacts.sort();
            getContacts.filter((v, i, a) => a.indexOf(v) === i);
        }
        const newBaileys = yield baileysExists.update({
            chats: JSON.stringify(getChats),
            contacts: JSON.stringify(getContacts)
        });
        return newBaileys;
    }
    const baileys = yield Baileys_1.default.create({
        whatsappId,
        contacts: JSON.stringify(contacts),
        chats: JSON.stringify(chats)
    });
    return baileys;
});
exports.default = createOrUpdateBaileysService;
