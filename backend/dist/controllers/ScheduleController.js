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
exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const socket_1 = require("../libs/socket");
const AppError_1 = __importDefault(require("../errors/AppError"));
const CreateService_1 = __importDefault(require("../services/ScheduleServices/CreateService"));
const ListService_1 = __importDefault(require("../services/ScheduleServices/ListService"));
const UpdateService_1 = __importDefault(require("../services/ScheduleServices/UpdateService"));
const ShowService_1 = __importDefault(require("../services/ScheduleServices/ShowService"));
const DeleteService_1 = __importDefault(require("../services/ScheduleServices/DeleteService"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { contactId, userId, pageNumber, searchParam } = req.query;
    const { schedules, count, hasMore } = yield (0, ListService_1.default)({
        searchParam,
        contactId,
        userId,
        pageNumber
    });
    return res.json({ schedules, count, hasMore });
});
exports.index = index;
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body, sendAt, contactId, userId } = req.body;
    const schedule = yield (0, CreateService_1.default)({
        body,
        sendAt,
        contactId,
        userId
    });
    const io = (0, socket_1.getIO)();
    io.emit("schedule", {
        action: "create",
        schedule
    });
    return res.status(200).json(schedule);
});
exports.store = store;
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { scheduleId } = req.params;
    const schedule = yield (0, ShowService_1.default)(scheduleId);
    return res.status(200).json(schedule);
});
exports.show = show;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { scheduleId } = req.params;
    const scheduleData = req.body;
    const schedule = yield (0, UpdateService_1.default)({ scheduleData, id: scheduleId });
    const io = (0, socket_1.getIO)();
    io.emit("schedule", {
        action: "update",
        schedule
    });
    return res.status(200).json(schedule);
});
exports.update = update;
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { scheduleId } = req.params;
    yield (0, DeleteService_1.default)(scheduleId);
    const io = (0, socket_1.getIO)();
    io.emit("schedule", {
        action: "delete",
        scheduleId
    });
    return res.status(200).json({ message: "Schedule deleted" });
});
exports.remove = remove;
