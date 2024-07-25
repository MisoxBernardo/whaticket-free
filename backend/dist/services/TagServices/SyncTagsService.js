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
const Tag_1 = __importDefault(require("../../models/Tag"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const SyncTags = ({ tags, ticketId }) => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = yield Ticket_1.default.findByPk(ticketId, { include: [Tag_1.default] });
    const tagList = tags.map((t) => ({ tagId: t.id, ticketId }));
    yield TicketTag_1.default.destroy({ where: { ticketId } });
    yield TicketTag_1.default.bulkCreate(tagList);
    ticket === null || ticket === void 0 ? void 0 : ticket.reload();
    return ticket;
});
exports.default = SyncTags;
