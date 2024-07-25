"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.clean = exports.remove = exports.show = exports.store = exports.index = void 0;
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const GetRandWhatsApp_1 = __importDefault(require("../helpers/GetRandWhatsApp"));
const GetTicketWbot_1 = __importDefault(require("../helpers/GetTicketWbot"));
const socket_1 = require("../libs/socket");
const Contact_1 = __importDefault(require("../models/Contact"));
const CleanMassMessageervices_1 = __importDefault(require("../services/MassMessage/CleanMassMessageervices"));
const CreateMassMessageService_1 = __importDefault(require("../services/MassMessage/CreateMassMessageService"));
const DeleteMassMessageService_1 = __importDefault(require("../services/MassMessage/DeleteMassMessageService"));
const ListMassMessageService_1 = __importDefault(require("../services/MassMessage/ListMassMessageService"));
const FindOrCreateTicketService_1 = __importDefault(require("../services/TicketServices/FindOrCreateTicketService"));
const SendWhatsAppMedia_1 = __importDefault(require("../services/WbotServices/SendWhatsAppMedia"));
const wbotMessageListener_1 = require("../services/WbotServices/wbotMessageListener");
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { message, phone, whatsappId } = req.body;
    const medias = req.files;
    const formatNumber = phone.replace("-", "").replace(" ", "");
    const schema = Yup.object().shape({
        number: Yup.string()
            .required()
            .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
    });
    try {
        yield schema.validate({ number: formatNumber });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    let contact;
    contact = yield Contact_1.default.findOne({
        where: { number: formatNumber }
    });
    if (!contact) {
        contact = yield Contact_1.default.create({
            number: formatNumber,
            name: formatNumber
        });
    }
    try {
        let contactAndTicket;
        console.log(typeof whatsappId);
        if (whatsappId && typeof whatsappId === "number") {
            contactAndTicket = yield (0, FindOrCreateTicketService_1.default)({
                contact,
                whatsappId,
                channel: "whatsapp"
            });
            console.log("conexão definida.");
        }
        else {
            const random = yield (0, GetRandWhatsApp_1.default)();
            if (!random) {
                throw new AppError_1.default("ERR_NO_DEF_WAPP_FOUND");
            }
            console.log("conexão random");
            contactAndTicket = yield (0, FindOrCreateTicketService_1.default)({
                contact,
                whatsappId: random.id,
                channel: "whatsapp"
            });
        }
        if (medias) {
            yield Promise.all(medias.map((media) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, SendWhatsAppMedia_1.default)({
                    body: message,
                    media,
                    ticket: contactAndTicket
                });
            })));
        }
        else {
            const buttons = [
                { buttonId: "yes", buttonText: { displayText: "Sim" }, type: 1 },
                { buttonId: "no", buttonText: { displayText: "Não" }, type: 1 }
            ];
            const buttonMessage = {
                text: message || "Escolha uma das opções abaixo",
                buttons,
                headerType: 4
            };
            const wbot = yield (0, GetTicketWbot_1.default)(contactAndTicket);
            const isNumberExit = yield wbot.onWhatsApp(`${formatNumber}@s.whatsapp.net`);
            if (!((_a = isNumberExit[0]) === null || _a === void 0 ? void 0 : _a.exists)) {
                console.log("number not found");
            }
            console.log(isNumberExit);
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                var _b, _c;
                try {
                    const send = yield wbot.sendMessage((_b = isNumberExit[0]) === null || _b === void 0 ? void 0 : _b.jid, buttonMessage);
                    yield (0, wbotMessageListener_1.verifyMessage)(send, contactAndTicket, contact);
                }
                catch (err) {
                    console.log(`Mensagem não enviada para o contato. ${(_c = isNumberExit[0]) === null || _c === void 0 ? void 0 : _c.jid}`);
                }
            }), 1000 * 5);
        }
        return res.send();
    }
    catch (error) {
        console.log(error);
    }
});
exports.index = index;
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    // remover os registros repetidos
    const filter = body
        .map((e) => JSON.stringify(e))
        .reduce(
    // eslint-disable-next-line no-sequences
    (acc, cur) => (acc.includes(cur) || acc.push(cur), acc), [])
        .map((e) => JSON.parse(e));
    filter.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, CreateMassMessageService_1.default)(element);
    }));
    return res.status(200).json(body);
});
exports.store = store;
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchParam, pageNumber } = req.query;
    const { messages, count, hasMore } = yield (0, ListMassMessageService_1.default)({
        searchParam,
        pageNumber
    });
    return res.json({ messages, count, hasMore });
});
exports.show = show;
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { massMessageId } = req.params;
    yield (0, DeleteMassMessageService_1.default)(massMessageId);
    const io = (0, socket_1.getIO)();
    io.emit("massMessage", {
        action: "delete",
        massMessageId
    });
    return res.status(200).json({ message: "Registro deletado" });
});
exports.remove = remove;
const clean = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, CleanMassMessageervices_1.default)();
    return res.status(200).json({ message: "Registro deletado" });
});
exports.clean = clean;
