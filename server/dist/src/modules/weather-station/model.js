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
exports.deleteWeatherStationById = exports.findAllWeatherStations = exports.findWeatherStationById = exports.updateWeatherStationById = exports.WeatherStationModel = exports.weatherStationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.weatherStationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    secret: {
        type: String,
        required: true,
    },
    unavailable: {
        type: Boolean,
        default: false,
    },
    active: {
        type: Boolean,
        default: true,
    },
    lastActiveAt: {
        type: String,
    },
});
exports.WeatherStationModel = (0, mongoose_1.model)("weather-station", exports.weatherStationSchema);
const updateWeatherStationById = (id, updateBody, options) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.WeatherStationModel.findByIdAndUpdate(id, updateBody, options); });
exports.updateWeatherStationById = updateWeatherStationById;
const findWeatherStationById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.WeatherStationModel.findById(id); });
exports.findWeatherStationById = findWeatherStationById;
const findAllWeatherStations = (filter) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.WeatherStationModel.find(filter); });
exports.findAllWeatherStations = findAllWeatherStations;
const deleteWeatherStationById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.WeatherStationModel.findByIdAndDelete(id); });
exports.deleteWeatherStationById = deleteWeatherStationById;
