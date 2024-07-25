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
const Contact_1 = __importDefault(require("../../models/Contact"));
const logger_1 = require("../../utils/logger");
const ShowBaileysService_1 = __importDefault(require("../BaileysServices/ShowBaileysService"));
const CreateContactService_1 = __importDefault(require("../ContactServices/CreateContactService"));
const ImportContactsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const defaultWhatsapp = yield (0, GetDefaultWhatsApp_1.default)(userId);
    const wbot = (0, wbot_1.getWbot)(defaultWhatsapp.id);
    let phoneContacts;
    try {
        const contactsString = yield (0, ShowBaileysService_1.default)(wbot.id);
        phoneContacts = JSON.parse(JSON.stringify(contactsString.contacts));
    }
    catch (err) {
        logger_1.logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
    }
    phoneContacts.forEach(({ id, name }) => __awaiter(void 0, void 0, void 0, function* () {
        if (id === "status@broadcast" || id.includes("g.us") === "g.us")
            return;
        const number = id.replace(/\D/g, "");
        const numberExists = yield Contact_1.default.findOne({
            where: { number }
        });
        if (!numberExists) {
            try {
                yield (0, CreateContactService_1.default)({ number, name });
            }
            catch (error) {
                console.log(error);
                logger_1.logger.warn(`Could not get whatsapp contacts from phone. Err: ${error}`);
            }
        }
    }));
});
exports.default = ImportContactsService;
