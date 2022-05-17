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
exports.wellnessCheck = exports.authorizeWeatherStation = exports.deleteWeatherStation = exports.update = exports.findOne = exports.findAll = exports.create = void 0;
const types_1 = require("../../types");
const model_1 = require("./model");
const exceptions_1 = require("../../exceptions");
const jsonwebtoken_1 = require("jsonwebtoken");
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newWeatherStation = new model_1.WeatherStationModel(req.body);
        const result = yield newWeatherStation.save();
        res.json(result);
    }
    catch (err) {
        if (err instanceof exceptions_1.HttpException) {
            res.status(err.status).json({
                error: {
                    message: err.message,
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        else {
            throw err;
        }
    }
});
exports.create = create;
const findAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const locations = yield (0, model_1.findAllWeatherStations)(req.body);
        res.send(locations);
    }
    catch (err) {
        if (err instanceof exceptions_1.HttpException) {
            res.status(500).json({
                error: {
                    message: err.message,
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        else {
            throw err;
        }
    }
});
exports.findAll = findAll;
const findOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const location = yield (0, model_1.findWeatherStationById)(req.params.id);
        if (!location) {
            return res.status(404).json({
                error: {
                    message: "Weather station not found",
                    status: types_1.StatusCode.RECORD_NOT_FOUND,
                    code: types_1.ErrorCode.NOT_FOUND,
                },
            });
        }
        res.send(location);
    }
    catch (err) {
        if (err instanceof exceptions_1.HttpException) {
            res.status(500).json({
                error: {
                    message: err.message,
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
    }
});
exports.findOne = findOne;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const station = yield (0, model_1.findWeatherStationById)(id);
        if (!station) {
            return res.status(types_1.StatusCode.RECORD_NOT_FOUND).json({
                error: {
                    message: "Weather station not found",
                    status: types_1.StatusCode.RECORD_NOT_FOUND,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        const updatedStation = yield (0, model_1.updateWeatherStationById)(id, req.body);
        if (!updatedStation) {
            return res.status(types_1.StatusCode.SERVER_ERROR).json({
                error: {
                    message: "Error occurred when updating the weather station, please try again later",
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        res.send(updatedStation);
    }
    catch (err) {
        if (err instanceof exceptions_1.HttpException) {
            res.status(err.status).json({
                error: {
                    message: err.message,
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
    }
});
exports.update = update;
const deleteWeatherStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const station = yield (0, model_1.findWeatherStationById)(id);
        if (!station) {
            return res.status(types_1.StatusCode.RECORD_NOT_FOUND).json({
                error: {
                    message: "Weather station not found",
                    status: types_1.StatusCode.RECORD_NOT_FOUND,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        const deletedStation = yield (0, model_1.deleteWeatherStationById)(id);
        if (!deletedStation) {
            return res.status(types_1.StatusCode.SERVER_ERROR).json({
                error: {
                    message: "Error occurred when deleting the weather station, please try again later",
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        res.send({ success: true });
    }
    catch (err) {
        if (err instanceof exceptions_1.HttpException) {
            res.status(err.status).json({
                error: {
                    message: err.message,
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
    }
});
exports.deleteWeatherStation = deleteWeatherStation;
const authorizeWeatherStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { secret } = req.body;
        const station = yield (0, model_1.findWeatherStationBySecret)(secret);
        if (station) {
            const token = (0, jsonwebtoken_1.sign)({ nodeId: station.id }, process.env.JWT_SECRET, {
                expiresIn: 7200, // in two hours
            });
            return res.status(200).json({
                token,
            });
        }
        else {
            res.status(400).json({
                error: {
                    message: "You either send a wrong code or the station doesn't exist",
                    status: types_1.StatusCode.WRONG_INPUT,
                    code: types_1.ErrorCode.BAD_REQUEST,
                },
            });
        }
    }
    catch (err) {
        if (err instanceof exceptions_1.HttpException) {
            res.status(err.status).json({
                error: {
                    message: err.message,
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        throw err;
    }
});
exports.authorizeWeatherStation = authorizeWeatherStation;
const wellnessCheck = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const nowBefore10m = new Date();
        nowBefore10m.setMinutes(now.getMinutes() - 10);
        const rottenStations = yield (0, model_1.findAllWeatherStations)({
            active: true,
            unavailable: false,
            lastActiveAt: {
                $lte: nowBefore10m.toISOString(),
            },
        });
        let updatedStations = [];
        for (const station of rottenStations) {
            yield (0, model_1.updateWeatherStationById)(station.id, {
                active: false,
                unavailable: true,
            });
            updatedStations.push(station);
        }
        return updatedStations;
    }
    catch (err) {
        throw err;
    }
});
exports.wellnessCheck = wellnessCheck;
