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
exports.deleteMeasurementById = exports.findAllMeasurements = exports.updateMeasurementById = exports.findMeasurementById = exports.MeasurementModel = exports.measurementSchema = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
exports.measurementSchema = new mongoose_1.Schema({
    temperature: {
        type: Number,
        required: true,
    },
    humidity: {
        type: Number,
        required: true,
    },
    measuredAt: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["5-minutes", "hour", "day", "month", "year"],
    },
    nodeId: {
        type: mongoose_2.Types.ObjectId,
        ref: "weather-station",
    },
});
exports.MeasurementModel = (0, mongoose_1.model)("measurement", exports.measurementSchema);
const findMeasurementById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.MeasurementModel.findById(id); });
exports.findMeasurementById = findMeasurementById;
const updateMeasurementById = (id, updateBody) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.MeasurementModel.findByIdAndUpdate(id, updateBody); });
exports.updateMeasurementById = updateMeasurementById;
const findAllMeasurements = (filter, projection, queryOptions) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.MeasurementModel.find(filter, projection, queryOptions); });
exports.findAllMeasurements = findAllMeasurements;
const deleteMeasurementById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.MeasurementModel.findByIdAndDelete(id); });
exports.deleteMeasurementById = deleteMeasurementById;
