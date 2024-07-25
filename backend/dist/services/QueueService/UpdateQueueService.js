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
const sequelize_1 = require("sequelize");
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const Chatbot_1 = __importDefault(require("../../models/Chatbot"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const ShowQueueService_1 = __importDefault(require("./ShowQueueService"));
const UpdateQueueService = (queueId, queueData) => __awaiter(void 0, void 0, void 0, function* () {
    const { color, name, chatbots } = queueData;
    const queueSchema = Yup.object().shape({
        name: Yup.string()
            .min(2, "ERR_QUEUE_INVALID_NAME")
            .test("Check-unique-name", "ERR_QUEUE_NAME_ALREADY_EXISTS", (value) => __awaiter(void 0, void 0, void 0, function* () {
            if (value) {
                const queueWithSameName = yield Queue_1.default.findOne({
                    where: { name: value, id: { [sequelize_1.Op.not]: queueId } }
                });
                return !queueWithSameName;
            }
            return true;
        })),
        color: Yup.string()
            .required("ERR_QUEUE_INVALID_COLOR")
            .test("Check-color", "ERR_QUEUE_INVALID_COLOR", (value) => __awaiter(void 0, void 0, void 0, function* () {
            if (value) {
                const colorTestRegex = /^#[0-9a-f]{3,6}$/i;
                return colorTestRegex.test(value);
            }
            return true;
        }))
            .test("Check-color-exists", "ERR_QUEUE_COLOR_ALREADY_EXISTS", (value) => __awaiter(void 0, void 0, void 0, function* () {
            if (value) {
                const queueWithSameColor = yield Queue_1.default.findOne({
                    where: { color: value, id: { [sequelize_1.Op.not]: queueId } }
                });
                return !queueWithSameColor;
            }
            return true;
        }))
    });
    try {
        yield queueSchema.validate({ color, name });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    const queue = yield (0, ShowQueueService_1.default)(queueId);
    if (chatbots) {
        yield Promise.all(chatbots.map((bot) => __awaiter(void 0, void 0, void 0, function* () {
            yield Chatbot_1.default.upsert(Object.assign(Object.assign({}, bot), { queueId: queue.id }));
        })));
        yield Promise.all(queue.chatbots.map((oldBot) => __awaiter(void 0, void 0, void 0, function* () {
            const stillExists = chatbots.findIndex(bot => bot.id === oldBot.id);
            if (stillExists === -1) {
                yield Chatbot_1.default.destroy({ where: { id: oldBot.id } });
            }
        })));
    }
    yield queue.update(queueData);
    yield queue.reload({
        attributes: ["id", "color", "name", "greetingMessage"],
        include: [
            {
                model: Chatbot_1.default,
                as: "chatbots",
                attributes: ["id", "name", "greetingMessage"],
                order: [[{ model: Chatbot_1.default, as: "chatbots" }, "id", "asc"], ["id", "ASC"]]
            }
        ],
        order: [[{ model: Chatbot_1.default, as: "chatbots" }, "id", "asc"], ["id", "ASC"]]
    });
    return queue;
});
exports.default = UpdateQueueService;
