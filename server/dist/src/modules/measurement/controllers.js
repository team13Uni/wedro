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
exports.getBuckets = exports.downscaleData = exports.deleteMeasurement = exports.findOne = exports.findAll = exports.create = void 0;
const date_fns_1 = require("date-fns");
const types_1 = require("../../types");
const model_1 = require("./model");
const exceptions_1 = require("../../exceptions");
const model_2 = require("../weather-station/model");
const model_3 = require("../location/model");
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!req.nodeId)
            return res.json({ success: false });
        const location = yield (0, model_3.findLocationByNodeId)(req.nodeId);
        for (const bodyItem of body) {
            const weatherStation = yield (0, model_2.findWeatherStationById)(req.nodeId);
            if (!weatherStation) {
                return res.status(types_1.StatusCode.RECORD_NOT_FOUND).json({
                    success: false,
                    error: {
                        message: "Weather station doesn't exist",
                        status: types_1.StatusCode.RECORD_NOT_FOUND,
                        code: types_1.ErrorCode.NOT_FOUND,
                    },
                });
            }
            const date = new Date(bodyItem.measuredAt);
            const newMeasurement = new model_1.MeasurementModel(Object.assign(Object.assign({}, bodyItem), { type: "hour", nodeId: req.nodeId, locationId: location ? location.id : undefined, measuredAt: date.toISOString() }));
            yield newMeasurement.save();
        }
        const lastActiveAtDate = new Date(body[body.length - 1].measuredAt);
        yield (0, model_2.updateWeatherStationById)(req.nodeId, {
            lastActiveAt: lastActiveAtDate,
        });
        res.json({ success: true });
    }
    catch (err) {
        if (err instanceof exceptions_1.HttpException) {
            res.status(err.status).json({
                success: false,
                error: {
                    message: err.message,
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        else {
            res.status(types_1.StatusCode.SERVER_ERROR).json({ success: false });
        }
    }
});
exports.create = create;
const findAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const measurements = yield (0, model_1.findAllMeasurements)(req.body);
        res.send(measurements);
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
exports.findAll = findAll;
const findOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const measurement = yield (0, model_1.findMeasurementById)(req.params.id);
        if (!measurement) {
            return res.status(404).json({
                error: {
                    message: "Measurement not found",
                    status: types_1.StatusCode.RECORD_NOT_FOUND,
                    code: types_1.ErrorCode.NOT_FOUND,
                },
            });
        }
        res.send(measurement);
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
exports.findOne = findOne;
const deleteMeasurement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const measurement = yield (0, model_1.findMeasurementById)(id);
        if (!measurement) {
            return res.status(types_1.StatusCode.RECORD_NOT_FOUND).json({
                error: {
                    message: "Measurement not found",
                    status: types_1.StatusCode.RECORD_NOT_FOUND,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        const deletedMeasurement = yield (0, model_1.deleteMeasurementById)(id);
        if (!deletedMeasurement) {
            return res.status(types_1.StatusCode.SERVER_ERROR).json({
                error: {
                    message: "Error occurred when deleting the measurement, please try again later",
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
exports.deleteMeasurement = deleteMeasurement;
const downscaleData = (type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const minDate = new Date();
        let min;
        let findType;
        switch (type) {
            case "day": {
                minDate.setDate(now.getDate() - 1);
                min = minDate.toISOString();
                findType = "hour";
                break;
            }
            case "month": {
                minDate.setMonth(now.getMonth() - 1);
                min = minDate.toISOString();
                findType = "day";
                break;
            }
            case "year":
                minDate.setFullYear(now.getFullYear() - 1);
                min = minDate.toISOString();
                findType = "month";
                break;
        }
        const measurements = yield (0, model_1.findAllMeasurements)({
            measuredAt: { $lte: min, $gte: now.toISOString() },
            type,
        });
        let numbers = {};
        for (const measurement of measurements) {
            // @ts-ignore
            const locationId = String(measurement.locationId);
            if (!numbers[locationId])
                numbers[locationId] = {
                    temperature: 0,
                    humidity: 0,
                    numberOfMeasurements: 0,
                };
            numbers[locationId].temperature += measurement.temperature;
            numbers[locationId].humidity += measurement.humidity;
            numbers[locationId].numberOfMeasurements += 1;
        }
        const keys = Object.keys(numbers);
        const savedMeasurements = [];
        for (const key of keys) {
            const data = numbers[key];
            const newMeasurement = new model_1.MeasurementModel({
                locationId: key,
                type,
                temperature: data.temperature / data.numberOfMeasurements,
                humidity: data.humidity / data.numberOfMeasurements,
                measuredAt: now.toISOString(),
            });
            const savedMeasurement = yield newMeasurement.save();
            savedMeasurements.push(savedMeasurement);
        }
        return savedMeasurements;
    }
    catch (err) {
        throw err;
    }
});
exports.downscaleData = downscaleData;
/**
 * Returns buckets with temperature and humidity data for specified date range and granularity (type)
 */
const getBuckets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dateFrom = new Date(req.query.dateFrom);
        const dateTo = new Date(req.query.dateTo);
        const measurements = yield model_1.MeasurementModel.find({
            nodeId: req.params.weatherStationId,
            measuredAt: { $gte: dateFrom, $lte: dateTo },
            type: req.query.type,
        });
        let buckets = [];
        switch (req.query.type) {
            case "hour":
                buckets = (0, date_fns_1.eachHourOfInterval)({ start: dateFrom, end: dateTo });
                break;
            case "day":
                buckets = (0, date_fns_1.eachDayOfInterval)({ start: dateFrom, end: dateTo });
                break;
            case "month":
                buckets = (0, date_fns_1.eachMonthOfInterval)({ start: dateFrom, end: dateTo });
                break;
            case "year":
                buckets = (0, date_fns_1.eachYearOfInterval)({ start: dateFrom, end: dateTo });
                break;
        }
        /** map or fill empty buckets */
        const data = buckets.map((bucketDate) => {
            const measurement = measurements.find((m) => (0, date_fns_1.isEqual)(new Date(m.toJSON().measuredAt), bucketDate));
            /** no measurement for the bucket, return empty bucket */
            if (!measurement) {
                return {
                    date: bucketDate.toISOString(),
                    /** TODO: calculate data instead of returning empty buckets */
                    temperature: 0,
                    humidity: 0,
                };
            }
            return {
                date: bucketDate.toISOString(),
                temperature: measurement.temperature,
                humidity: measurement.humidity,
            };
        });
        /** send the data */
        res.send(data);
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
exports.getBuckets = getBuckets;
