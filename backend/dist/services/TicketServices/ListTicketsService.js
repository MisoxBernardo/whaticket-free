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
const date_fns_1 = require("date-fns");
const lodash_1 = require("lodash");
const sequelize_1 = require("sequelize");
const Contact_1 = __importDefault(require("../../models/Contact"));
const Message_1 = __importDefault(require("../../models/Message"));
const Queue_1 = __importDefault(require("../../models/Queue"));
const Tag_1 = __importDefault(require("../../models/Tag"));
const Ticket_1 = __importDefault(require("../../models/Ticket"));
const TicketTag_1 = __importDefault(require("../../models/TicketTag"));
const Whatsapp_1 = __importDefault(require("../../models/Whatsapp"));
const ShowUserService_1 = __importDefault(require("../UserServices/ShowUserService"));
const ListTicketsService = ({ searchParam = "", pageNumber = "1", queueIds, tags, status, date, updatedAt, showAll, userId, withUnreadMessages }) => __awaiter(void 0, void 0, void 0, function* () {
    let whereCondition = {
        [sequelize_1.Op.or]: [{ userId }, { status: "pending" }],
        queueId: { [sequelize_1.Op.or]: [queueIds, null] }
    };
    let includeCondition;
    includeCondition = [
        {
            model: Contact_1.default,
            as: "contact",
            attributes: ["id", "name", "number", "profilePicUrl"]
        },
        {
            model: Queue_1.default,
            as: "queue",
            attributes: ["id", "name", "color"]
        },
        {
            model: Whatsapp_1.default,
            as: "whatsapp",
            attributes: ["name"]
        },
        {
            model: Tag_1.default,
            as: "tags",
            attributes: ["id", "name", "color"]
        }
    ];
    if (showAll === "true") {
        whereCondition = { queueId: { [sequelize_1.Op.or]: [queueIds, null] } };
    }
    if (status) {
        whereCondition = Object.assign(Object.assign({}, whereCondition), { status });
    }
    if (searchParam) {
        const sanitizedSearchParam = searchParam.toLocaleLowerCase().trim();
        includeCondition = [
            ...includeCondition,
            {
                model: Message_1.default,
                as: "messages",
                attributes: ["id", "body"],
                where: {
                    body: (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.col)("body")), "LIKE", `%${sanitizedSearchParam}%`)
                },
                required: false,
                duplicating: false
            }
        ];
        whereCondition = Object.assign(Object.assign({}, whereCondition), { [sequelize_1.Op.or]: [
                {
                    "$contact.name$": (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.col)("contact.name")), "LIKE", `%${sanitizedSearchParam}%`)
                },
                { "$contact.number$": { [sequelize_1.Op.like]: `%${sanitizedSearchParam}%` } },
                {
                    "$message.body$": (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.col)("body")), "LIKE", `%${sanitizedSearchParam}%`)
                }
            ] });
    }
    if (date) {
        whereCondition = {
            createdAt: {
                [sequelize_1.Op.between]: [+(0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(date)), +(0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(date))]
            }
        };
    }
    if (updatedAt) {
        whereCondition = {
            updatedAt: {
                [sequelize_1.Op.between]: [
                    +(0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(updatedAt)),
                    +(0, date_fns_1.endOfDay)((0, date_fns_1.parseISO)(updatedAt))
                ]
            }
        };
    }
    if (withUnreadMessages === "true") {
        const user = yield (0, ShowUserService_1.default)(userId);
        const userQueueIds = user.queues.map(queue => queue.id);
        whereCondition = {
            [sequelize_1.Op.or]: [{ userId }, { status: "pending" }],
            queueId: { [sequelize_1.Op.or]: [userQueueIds, null] },
            unreadMessages: { [sequelize_1.Op.gt]: 0 }
        };
    }
    if (Array.isArray(tags) && tags.length > 0) {
        const ticketsTagFilter = [];
        for (let tag of tags) {
            const ticketTags = yield TicketTag_1.default.findAll({ where: { tagId: tag } });
            if (ticketTags) {
                ticketsTagFilter.push(ticketTags.map(t => t.ticketId));
            }
        }
        const ticketsIntersection = (0, lodash_1.intersection)(...ticketsTagFilter);
        whereCondition = {
            id: {
                [sequelize_1.Op.in]: ticketsIntersection
            }
        };
    }
    const limit = 40;
    const offset = limit * (+pageNumber - 1);
    const { count, rows: tickets } = yield Ticket_1.default.findAndCountAll({
        where: whereCondition,
        include: includeCondition,
        distinct: true,
        limit,
        offset,
        order: [["updatedAt", "DESC"]],
        subQuery: false
    });
    const hasMore = count > offset + tickets.length;
    return {
        tickets,
        count,
        hasMore
    };
});
exports.default = ListTicketsService;
