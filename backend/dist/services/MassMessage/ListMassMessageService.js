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
const sequelize_1 = require("sequelize");
const MassMessages_1 = __importDefault(require("../../models/MassMessages"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const ListMassMessageService = ({ searchParam = "", pageNumber = "1" }) => __awaiter(void 0, void 0, void 0, function* () {
    const whereCondition = {
        phone: sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("phone")), "LIKE", `%${searchParam.toLowerCase().trim()}%`)
    };
    const limit = 20;
    const offset = limit * (+pageNumber - 1);
    const { count, rows: messages } = yield MassMessages_1.default.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [["message", "ASC"]],
        include: [
            {
                model: Whatsapp_1.default,
                as: "whatsapp",
                attributes: ["name"]
            }
        ]
    });
    const hasMore = count > offset + messages.length;
    return {
        messages,
        count,
        hasMore
    };
});
exports.default = ListMassMessageService;
