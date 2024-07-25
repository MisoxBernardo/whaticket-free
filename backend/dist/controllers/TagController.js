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
exports.syncTags = exports.list = exports.remove = exports.update = exports.show = exports.store = exports.index = void 0;
const socket_1 = require("../libs/socket");
const AppError_1 = __importDefault(require("../errors/AppError"));
const CreateService_1 = __importDefault(require("../services/TagServices/CreateService"));
const ListService_1 = __importDefault(require("../services/TagServices/ListService"));
const UpdateService_1 = __importDefault(require("../services/TagServices/UpdateService"));
const ShowService_1 = __importDefault(require("../services/TagServices/ShowService"));
const DeleteService_1 = __importDefault(require("../services/TagServices/DeleteService"));
const SimpleListService_1 = __importDefault(require("../services/TagServices/SimpleListService"));
const SyncTagsService_1 = __importDefault(require("../services/TagServices/SyncTagsService"));
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageNumber, searchParam } = req.query;
    const { tags, count, hasMore } = yield (0, ListService_1.default)({
        searchParam,
        pageNumber
    });
    return res.json({ tags, count, hasMore });
});
exports.index = index;
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, color } = req.body;
    const tag = yield (0, CreateService_1.default)({
        name,
        color
    });
    const io = (0, socket_1.getIO)();
    io.emit("tag", {
        action: "create",
        tag
    });
    return res.status(200).json(tag);
});
exports.store = store;
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tagId } = req.params;
    const tag = yield (0, ShowService_1.default)(tagId);
    return res.status(200).json(tag);
});
exports.show = show;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.profile !== "admin") {
        throw new AppError_1.default("ERR_NO_PERMISSION", 403);
    }
    const { tagId } = req.params;
    const tagData = req.body;
    const tag = yield (0, UpdateService_1.default)({ tagData, id: tagId });
    const io = (0, socket_1.getIO)();
    io.emit("tag", {
        action: "update",
        tag
    });
    return res.status(200).json(tag);
});
exports.update = update;
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tagId } = req.params;
    yield (0, DeleteService_1.default)(tagId);
    const io = (0, socket_1.getIO)();
    io.emit("tag", {
        action: "delete",
        tagId
    });
    return res.status(200).json({ message: "Tag deleted" });
});
exports.remove = remove;
const list = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchParam } = req.query;
    const tags = yield (0, SimpleListService_1.default)({ searchParam });
    return res.json(tags);
});
exports.list = list;
const syncTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        if (data) {
            const tags = yield (0, SyncTagsService_1.default)(data);
            return res.json(tags);
        }
    }
    catch (err) {
        throw new AppError_1.default("ERR_SYNC_TAGS", 500);
    }
});
exports.syncTags = syncTags;
