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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocationById = exports.findAllLocations = exports.updateLocationById = exports.findLocationByNodeId = exports.findLocationById = exports.LocationModel = exports.locationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.locationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    nodeId: {
        type: mongoose_1.Types.ObjectId,
        ref: "weather-station",
    },
    state: {
        type: String,
        default: "active",
        enum: ["active", "inactive"],
    },
    seaLevel: {
        type: Number,
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    },
});
exports.LocationModel = (0, mongoose_1.model)("location", exports.locationSchema);
const findLocationById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.LocationModel.findById(id); });
exports.findLocationById = findLocationById;
const findLocationByNodeId = (nodeId) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.LocationModel.findOne({ nodeId }); });
exports.findLocationByNodeId = findLocationByNodeId;
const updateLocationById = (id, updateBody) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.LocationModel.findByIdAndUpdate(id, updateBody); });
exports.updateLocationById = updateLocationById;
const findAllLocations = (filter) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.LocationModel.find(filter); });
exports.findAllLocations = findAllLocations;
const deleteLocationById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.LocationModel.findByIdAndDelete(id); });
exports.deleteLocationById = deleteLocationById;
