"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Baileys_1 = __importDefault(require("../models/Baileys"));
const BaileysSessions_1 = __importDefault(require("../models/BaileysSessions"));
const Chatbot_1 = __importDefault(require("../models/Chatbot"));
const Contact_1 = __importDefault(require("../models/Contact"));
const ContactCustomField_1 = __importDefault(require("../models/ContactCustomField"));
const DialogChatBots_1 = __importDefault(require("../models/DialogChatBots"));
// import dbConfig from "../config/database";
const MassMessages_1 = __importDefault(require("../models/MassMessages"));
const Message_1 = __importDefault(require("../models/Message"));
const Queue_1 = __importDefault(require("../models/Queue"));
const QuickAnswer_1 = __importDefault(require("../models/QuickAnswer"));
const Schedule_1 = __importDefault(require("../models/Schedule"));
const Setting_1 = __importDefault(require("../models/Setting"));
const SettingMessage_1 = __importDefault(require("../models/SettingMessage"));
const Tag_1 = __importDefault(require("../models/Tag"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const TicketTag_1 = __importDefault(require("../models/TicketTag"));
const User_1 = __importDefault(require("../models/User"));
const UserQueue_1 = __importDefault(require("../models/UserQueue"));
const Whatsapp_1 = __importDefault(require("../models/Whatsapp"));
const WhatsappQueue_1 = __importDefault(require("../models/WhatsappQueue"));
// eslint-disable-next-line
const dbConfig = require("../config/database");
const sequelize = new sequelize_typescript_1.Sequelize(dbConfig);
const models = [
    User_1.default,
    Contact_1.default,
    Ticket_1.default,
    Message_1.default,
    Whatsapp_1.default,
    ContactCustomField_1.default,
    Setting_1.default,
    Queue_1.default,
    WhatsappQueue_1.default,
    UserQueue_1.default,
    QuickAnswer_1.default,
    Baileys_1.default,
    Chatbot_1.default,
    DialogChatBots_1.default,
    Schedule_1.default,
    Tag_1.default,
    TicketTag_1.default,
    SettingMessage_1.default,
    MassMessages_1.default,
    BaileysSessions_1.default
];
sequelize.addModels(models);
exports.default = sequelize;
