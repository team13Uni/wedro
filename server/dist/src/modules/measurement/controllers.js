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
const exceptions_1 = require("../../exceptions");
const types_1 = require("../../types");
const model_1 = require("../weather-station/model");
const model_2 = require("./model");
const model_3 = require("../location/model");
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!req.nodeId)
            return res.status(types_1.StatusCode.NOT_AUTHORIZED);
        const location = yield (0, model_3.findLocationByNodeId)(req.nodeId);
        for (const bodyItem of body) {
            const weatherStation = yield (0, model_1.findWeatherStationById)(req.nodeId);
            if (!weatherStation) {
                return res.status(types_1.StatusCode.RECORD_NOT_FOUND).json({
                    error: {
                        message: "Weather station doesn't exist",
                        status: types_1.StatusCode.RECORD_NOT_FOUND,
                        code: types_1.ErrorCode.NOT_FOUND,
                    },
                });
            }
            const date = new Date(bodyItem.measuredAt);
            const newMeasurement = new model_2.MeasurementModel(Object.assign(Object.assign({}, bodyItem), { type: "5-minutes", nodeId: req.nodeId, locationId: location ? location.id : undefined, measuredAt: date.toISOString() }));
            yield newMeasurement.save();
        }
        const lastActiveAtDate = new Date(body[body.length - 1].measuredAt);
        yield (0, model_1.updateWeatherStationById)(req.nodeId, {
            lastActiveAt: lastActiveAtDate,
        });
        const lastSentItem = body[body.length - 1];
        res.json(lastSentItem);
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
            res.status(types_1.StatusCode.SERVER_ERROR);
        }
    }
});
exports.create = create;
const findAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const measurements = yield (0, model_2.findAllMeasurements)(req.body);
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
        const measurement = yield (0, model_2.findMeasurementById)(req.params.id);
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
        const measurement = yield (0, model_2.findMeasurementById)(id);
        if (!measurement) {
            return res.status(types_1.StatusCode.RECORD_NOT_FOUND).json({
                error: {
                    message: "Measurement not found",
                    status: types_1.StatusCode.RECORD_NOT_FOUND,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        const deletedMeasurement = yield (0, model_2.deleteMeasurementById)(id);
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
            case "hour": {
                minDate.setHours(now.getHours() - 1);
                min = minDate.toISOString();
                findType = "5-minutes";
                break;
            }
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
        const measurements = yield (0, model_2.findAllMeasurements)({
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
            const newMeasurement = new model_2.MeasurementModel({
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
        const measurements = yield model_2.MeasurementModel.find({
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
        const data = buckets.map((bucketDate, index, mappedBuckets) => {
            const measurement = measurements.find((m) => (0, date_fns_1.isEqual)(new Date(m.toJSON().measuredAt), bucketDate));
            /** no measurement for the bucket, return empty bucket */
            if (!measurement) {
                return {
                    date: bucketDate.toISOString(),
                    temperature: null,
                    humidity: null,
                };
            }
            return {
                date: bucketDate.toISOString(),
                temperature: measurement.temperature,
                humidity: measurement.humidity,
            };
        });
        /** TODO: find a more performant way of doing so */
        /** fill empty buckets */
        const dataWithFilledBuckets = data.map((bucket, index) => {
            var _a, _b, _c, _d;
            if (!bucket.humidity || !bucket.temperature) {
                const previousBucketWithTemp = data
                    .slice(0, index)
                    .reverse()
                    .find((b) => b.temperature);
                const previousBucketWithHum = (previousBucketWithTemp === null || previousBucketWithTemp === void 0 ? void 0 : previousBucketWithTemp.humidity)
                    ? previousBucketWithTemp
                    : data
                        .slice(0, index)
                        .reverse()
                        .find((b) => b.humidity);
                return {
                    date: bucket.date,
                    temperature: (_b = (_a = bucket.temperature) !== null && _a !== void 0 ? _a : previousBucketWithTemp === null || previousBucketWithTemp === void 0 ? void 0 : previousBucketWithTemp.temperature) !== null && _b !== void 0 ? _b : 0,
                    humidity: (_d = (_c = bucket.humidity) !== null && _c !== void 0 ? _c : previousBucketWithHum === null || previousBucketWithHum === void 0 ? void 0 : previousBucketWithHum.humidity) !== null && _d !== void 0 ? _d : 0,
                };
            }
            return bucket;
        });
        /** send the data */
        res.send(dataWithFilledBuckets);
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
