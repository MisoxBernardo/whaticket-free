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
exports.sayChatbot = exports.deleteAndCreateDialogStage = void 0;
const wbotMessageListener_1 = require("./wbotMessageListener");
const ShowDialogChatBotsServices_1 = __importDefault(require("../DialogChatBotsServices/ShowDialogChatBotsServices"));
const ShowQueueService_1 = __importDefault(require("../QueueService/ShowQueueService"));
const ShowChatBotServices_1 = __importDefault(require("../ChatBotServices/ShowChatBotServices"));
const DeleteDialogChatBotsServices_1 = __importDefault(require("../DialogChatBotsServices/DeleteDialogChatBotsServices"));
const ShowChatBotByChatbotIdServices_1 = __importDefault(require("../ChatBotServices/ShowChatBotByChatbotIdServices"));
const CreateDialogChatBotsServices_1 = __importDefault(require("../DialogChatBotsServices/CreateDialogChatBotsServices"));
const ShowWhatsAppService_1 = __importDefault(require("../WhatsappService/ShowWhatsAppService"));
const Mustache_1 = __importDefault(require("../../helpers/Mustache"));
const UpdateTicketService_1 = __importDefault(require("../TicketServices/UpdateTicketService"));
const User_1 = __importDefault(require("../../models/User"));
const Setting_1 = __importDefault(require("../../models/Setting"));
const isNumeric = (value) => /^-?\d+$/.test(value);
const deleteAndCreateDialogStage = (contact, chatbotId, ticket) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, DeleteDialogChatBotsServices_1.default)(contact.id);
        const bots = yield (0, ShowChatBotByChatbotIdServices_1.default)(chatbotId);
        if (!bots) {
            yield ticket.update({ isBot: false });
        }
        return yield (0, CreateDialogChatBotsServices_1.default)({
            awaiting: 1,
            contactId: contact.id,
            chatbotId,
            queueId: bots.queueId
        });
    }
    catch (error) {
        yield ticket.update({ isBot: false });
    }
});
exports.deleteAndCreateDialogStage = deleteAndCreateDialogStage;
const sendMessage = (wbot, contact, ticket, body) => __awaiter(void 0, void 0, void 0, function* () {
    const sentMessage = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
        text: (0, Mustache_1.default)(body, contact)
    });
    (0, wbotMessageListener_1.verifyMessage)(sentMessage, ticket, contact);
});
const sendDialog = (choosenQueue, wbot, contact, ticket) => __awaiter(void 0, void 0, void 0, function* () {
    const showChatBots = yield (0, ShowChatBotServices_1.default)(choosenQueue.id);
    if (showChatBots.options) {
        const buttonActive = yield Setting_1.default.findOne({
            where: {
                key: "chatBotType"
            }
        });
        const botText = () => __awaiter(void 0, void 0, void 0, function* () {
            let options = "";
            showChatBots.options.forEach((option, index) => {
                options += `*${index + 1}* - ${option.name}\n`;
            });
            const optionsBack = options.length > 0
                ? `${options}\n*#* Voltar para o menu principal`
                : options;
            if (options.length > 0) {
                const body = `\u200e${choosenQueue.greetingMessage}\n\n${optionsBack}`;
                const sendOption = yield sendMessage(wbot, contact, ticket, body);
                return sendOption;
            }
            const body = `\u200e${choosenQueue.greetingMessage}`;
            const send = yield sendMessage(wbot, contact, ticket, body);
            return send;
        });
        const botButton = () => __awaiter(void 0, void 0, void 0, function* () {
            const buttons = [];
            showChatBots.options.forEach((option, index) => {
                buttons.push({
                    buttonId: `${index + 1}`,
                    buttonText: { displayText: option.name },
                    type: 1
                });
            });
            if (buttons.length > 0) {
                const buttonMessage = {
                    text: `\u200e${choosenQueue.greetingMessage}`,
                    buttons,
                    headerType: 1
                };
                const send = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, buttonMessage);
                yield (0, wbotMessageListener_1.verifyMessage)(send, ticket, contact);
                return send;
            }
            const body = `\u200e${choosenQueue.greetingMessage}`;
            const send = yield sendMessage(wbot, contact, ticket, body);
            return send;
        });
        const botList = () => __awaiter(void 0, void 0, void 0, function* () {
            const sectionsRows = [];
            showChatBots.options.forEach((queue, index) => {
                sectionsRows.push({
                    title: queue.name,
                    rowId: `${index + 1}`
                });
            });
            if (sectionsRows.length > 0) {
                const sections = [
                    {
                        title: "Menu",
                        rows: sectionsRows
                    }
                ];
                const listMessage = {
                    text: (0, Mustache_1.default)(`\u200e${choosenQueue.greetingMessage}`, contact),
                    buttonText: "Escolha uma opção",
                    sections
                };
                const sendMsg = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, listMessage);
                yield (0, wbotMessageListener_1.verifyMessage)(sendMsg, ticket, contact);
                return sendMsg;
            }
            const body = `\u200e${choosenQueue.greetingMessage}`;
            const send = yield sendMessage(wbot, contact, ticket, body);
            return send;
        });
        if (buttonActive.value === "text") {
            return botText();
        }
        if (buttonActive.value === "button" && showChatBots.options.length > 4) {
            return botText();
        }
        if (buttonActive.value === "button" && showChatBots.options.length <= 4) {
            return botButton();
        }
        if (buttonActive.value === "list") {
            return botList();
        }
    }
});
const backToMainMenu = (wbot, contact, ticket) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, UpdateTicketService_1.default)({
        ticketData: { queueId: null },
        ticketId: ticket.id
    });
    const { queues, greetingMessage } = yield (0, ShowWhatsAppService_1.default)(wbot.id);
    const buttonActive = yield Setting_1.default.findOne({
        where: {
            key: "chatBotType"
        }
    });
    const botText = () => __awaiter(void 0, void 0, void 0, function* () {
        let options = "";
        queues.forEach((option, index) => {
            options += `*${index + 1}* - ${option.name}\n`;
        });
        const body = (0, Mustache_1.default)(`\u200e${greetingMessage}\n\n${options}`, contact);
        yield sendMessage(wbot, contact, ticket, body);
        const deleteDialog = yield (0, DeleteDialogChatBotsServices_1.default)(contact.id);
        return deleteDialog;
    });
    const botButton = () => __awaiter(void 0, void 0, void 0, function* () {
        const buttons = [];
        queues.forEach((queue, index) => {
            buttons.push({
                buttonId: `${index + 1}`,
                buttonText: { displayText: queue.name },
                type: 1
            });
        });
        const buttonMessage = {
            text: (0, Mustache_1.default)(`\u200e${greetingMessage}`, contact),
            buttons,
            headerType: 1
        };
        const sendMsg = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, buttonMessage);
        yield (0, wbotMessageListener_1.verifyMessage)(sendMsg, ticket, contact);
        const deleteDialog = yield (0, DeleteDialogChatBotsServices_1.default)(contact.id);
        return deleteDialog;
    });
    const botList = () => __awaiter(void 0, void 0, void 0, function* () {
        const sectionsRows = [];
        queues.forEach((queue, index) => {
            sectionsRows.push({
                title: queue.name,
                rowId: `${index + 1}`
            });
        });
        const sections = [
            {
                title: "Menu",
                rows: sectionsRows
            }
        ];
        const listMessage = {
            text: (0, Mustache_1.default)(`\u200e${greetingMessage}`, contact),
            buttonText: "Escolha uma opção",
            sections
        };
        const sendMsg = yield wbot.sendMessage(`${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, listMessage);
        yield (0, wbotMessageListener_1.verifyMessage)(sendMsg, ticket, contact);
        const deleteDialog = yield (0, DeleteDialogChatBotsServices_1.default)(contact.id);
        return deleteDialog;
    });
    if (buttonActive.value === "text") {
        return botText();
    }
    if (buttonActive.value === "button" && queues.length > 4) {
        return botText();
    }
    if (buttonActive.value === "button" && queues.length <= 4) {
        return botButton();
    }
    if (buttonActive.value === "list") {
        return botList();
    }
});
const sayChatbot = (queueId, wbot, ticket, contact, msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const selectedOption = ((_b = (_a = msg === null || msg === void 0 ? void 0 : msg.message) === null || _a === void 0 ? void 0 : _a.buttonsResponseMessage) === null || _b === void 0 ? void 0 : _b.selectedButtonId) ||
        ((_d = (_c = msg === null || msg === void 0 ? void 0 : msg.message) === null || _c === void 0 ? void 0 : _c.listResponseMessage) === null || _d === void 0 ? void 0 : _d.singleSelectReply.selectedRowId) ||
        (0, wbotMessageListener_1.getBodyMessage)(msg);
    console.log("Selecionado a opção: ", selectedOption);
    if (!queueId && selectedOption && msg.key.fromMe)
        return;
    const getStageBot = yield (0, ShowDialogChatBotsServices_1.default)(contact.id);
    if (selectedOption === "#") {
        const backTo = yield backToMainMenu(wbot, contact, ticket);
        return backTo;
    }
    if (!getStageBot) {
        const queue = yield (0, ShowQueueService_1.default)(queueId);
        const selectedOptions = ((_f = (_e = msg === null || msg === void 0 ? void 0 : msg.message) === null || _e === void 0 ? void 0 : _e.buttonsResponseMessage) === null || _f === void 0 ? void 0 : _f.selectedButtonId) ||
            ((_h = (_g = msg === null || msg === void 0 ? void 0 : msg.message) === null || _g === void 0 ? void 0 : _g.listResponseMessage) === null || _h === void 0 ? void 0 : _h.singleSelectReply.selectedRowId) ||
            (0, wbotMessageListener_1.getBodyMessage)(msg);
        console.log("!getStageBot", selectedOptions);
        const choosenQueue = queue.chatbots[+selectedOptions - 1];
        if (!(choosenQueue === null || choosenQueue === void 0 ? void 0 : choosenQueue.greetingMessage)) {
            yield (0, DeleteDialogChatBotsServices_1.default)(contact.id);
            return;
        } // nao tem mensagem de boas vindas
        if (choosenQueue) {
            if (choosenQueue.isAgent) {
                try {
                    const getUserByName = yield User_1.default.findOne({
                        where: {
                            name: choosenQueue.name
                        }
                    });
                    const ticketUpdateAgent = {
                        ticketData: {
                            userId: getUserByName.id,
                            status: "open"
                        },
                        ticketId: ticket.id
                    };
                    yield (0, UpdateTicketService_1.default)(ticketUpdateAgent);
                }
                catch (error) {
                    yield (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
                }
            }
            yield (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
            const send = yield sendDialog(choosenQueue, wbot, contact, ticket);
            return send;
        }
    }
    if (getStageBot) {
        const selected = isNumeric(selectedOption) ? selectedOption : 1;
        const bots = yield (0, ShowChatBotServices_1.default)(getStageBot.chatbotId);
        console.log("getStageBot", selected);
        const choosenQueue = bots.options[+selected - 1]
            ? bots.options[+selected - 1]
            : bots.options[0];
        console.log("choosenQueue", choosenQueue);
        if (!choosenQueue.greetingMessage) {
            yield (0, DeleteDialogChatBotsServices_1.default)(contact.id);
            return;
        } // nao tem mensagem de boas vindas
        if (choosenQueue) {
            if (choosenQueue.isAgent) {
                const getUserByName = yield User_1.default.findOne({
                    where: {
                        name: choosenQueue.name
                    }
                });
                const ticketUpdateAgent = {
                    ticketData: {
                        userId: getUserByName.id,
                        status: "open"
                    },
                    ticketId: ticket.id
                };
                yield (0, UpdateTicketService_1.default)(ticketUpdateAgent);
            }
            yield (0, exports.deleteAndCreateDialogStage)(contact, choosenQueue.id, ticket);
            const send = yield sendDialog(choosenQueue, wbot, contact, ticket);
            return send;
        }
    }
});
exports.sayChatbot = sayChatbot;
