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
exports.getCurrent = exports.getBuckets = exports.upscaleData = exports.downscaleData = exports.deleteMeasurement = exports.findOne = exports.findAll = exports.create = void 0;
const date_fns_1 = require("date-fns");
const exceptions_1 = require("../../exceptions");
const common_1 = require("../../helpers/common");
const types_1 = require("../../types");
const model_1 = require("../location/model");
const model_2 = require("../weather-station/model");
const helpers_1 = require("./helpers");
const model_3 = require("./model");
/**
 * Creates a new measurement.
 */
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!req.nodeId)
            return res.status(types_1.StatusCode.NOT_AUTHORIZED);
        const location = yield (0, model_1.findLocationByNodeId)(req.nodeId);
        for (const bodyItem of body) {
            const weatherStation = yield (0, model_2.findWeatherStationById)(req.nodeId);
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
            const newMeasurement = new model_3.MeasurementModel(Object.assign(Object.assign({}, bodyItem), { type: "5-minutes", nodeId: req.nodeId, locationId: location ? location.id : undefined, measuredAt: date.toISOString() }));
            yield newMeasurement.save();
        }
        const lastActiveAtDate = new Date(body[body.length - 1].measuredAt);
        yield (0, model_2.updateWeatherStationById)(req.nodeId, {
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
/**
 * Returns all measurements
 */
const findAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const measurements = yield (0, model_3.findAllMeasurements)(req.body);
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
/**
 * Returns one measurement by its ID
 */
const findOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const measurement = yield (0, model_3.findMeasurementById)(req.params.id);
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
/**
 * Deletes a measurement
 */
const deleteMeasurement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const measurement = yield (0, model_3.findMeasurementById)(id);
        if (!measurement) {
            return res.status(types_1.StatusCode.RECORD_NOT_FOUND).json({
                error: {
                    message: "Measurement not found",
                    status: types_1.StatusCode.RECORD_NOT_FOUND,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        const deletedMeasurement = yield (0, model_3.deleteMeasurementById)(id);
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
        // FIXME: errors are not handled
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
        let findType;
        let incrementBy;
        let lastDate;
        let lastDateTime;
        let nextDate;
        const queryOptions = { sort: { measuredAt: -1 }, limit: 1 };
        const fallbackQueryOptions = { sort: { measuredAt: 1 }, limit: 1 };
        switch (type) {
            case "hour": {
                findType = "5-minutes";
                incrementBy = 60 * 60 * 1000;
                let findLastHour = yield (0, model_3.findAllMeasurements)({ type: "hour" }, undefined, queryOptions);
                if ((findLastHour === null || findLastHour === void 0 ? void 0 : findLastHour.length) === 0) {
                    findLastHour = yield (0, model_3.findAllMeasurements)({ type: "5-minutes" }, undefined, fallbackQueryOptions);
                }
                lastDate = new Date(findLastHour[0].measuredAt);
                lastDateTime = lastDate.getTime();
                nextDate = new Date(lastDate).setHours(lastDate.getHours() + 1);
                break;
            }
            case "day": {
                findType = "hour";
                incrementBy = 24 * 60 * 60 * 1000;
                let findLastDay = yield (0, model_3.findAllMeasurements)({ type: "day" }, undefined, queryOptions);
                if ((findLastDay === null || findLastDay === void 0 ? void 0 : findLastDay.length) === 0) {
                    findLastDay = yield (0, model_3.findAllMeasurements)({ type: "hour" }, undefined, fallbackQueryOptions);
                }
                lastDate = new Date(findLastDay[0].measuredAt);
                lastDateTime = lastDate.getTime();
                nextDate = new Date(lastDate).setDate(lastDate.getDate() + 1);
                break;
            }
            case "month": {
                findType = "day";
                let findLastMonth = yield (0, model_3.findAllMeasurements)({ type: "month" }, undefined, queryOptions);
                if ((findLastMonth === null || findLastMonth === void 0 ? void 0 : findLastMonth.length) === 0) {
                    findLastMonth = yield (0, model_3.findAllMeasurements)({ type: "day" }, undefined, fallbackQueryOptions);
                }
                if ((findLastMonth === null || findLastMonth === void 0 ? void 0 : findLastMonth.length) === 0) {
                    findLastMonth = yield (0, model_3.findAllMeasurements)({ type: "hour" }, undefined, fallbackQueryOptions);
                }
                lastDate = new Date(findLastMonth[0].measuredAt);
                lastDate.setDate(1);
                if (findLastMonth[0].type === "month") {
                    lastDateTime = lastDate.setMonth(lastDate.getMonth() + 1);
                }
                else {
                    lastDateTime = lastDate.getTime();
                }
                nextDate = new Date(lastDate).setMonth(lastDate.getMonth() + 1);
                break;
            }
            case "year": {
                findType = "month";
                let findLastYear = yield (0, model_3.findAllMeasurements)({ type: "year" }, undefined, queryOptions);
                if ((findLastYear === null || findLastYear === void 0 ? void 0 : findLastYear.length) === 0) {
                    findLastYear = yield (0, model_3.findAllMeasurements)({ type: "month" }, undefined, queryOptions);
                }
                if ((findLastYear === null || findLastYear === void 0 ? void 0 : findLastYear.length) === 0) {
                    findLastYear = yield (0, model_3.findAllMeasurements)({ type: "day" }, undefined, queryOptions);
                }
                if ((findLastYear === null || findLastYear === void 0 ? void 0 : findLastYear.length) === 0) {
                    findLastYear = yield (0, model_3.findAllMeasurements)({ type: "hour" }, undefined, queryOptions);
                }
                lastDate = new Date(findLastYear[0].measuredAt);
                lastDateTime = lastDate.getTime();
                nextDate = new Date(lastDate).setFullYear(lastDate.getFullYear() + 1);
                break;
            }
        }
        const savedMeasurements = [];
        while (nextDate <= now.getTime()) {
            const stepValues = yield (0, model_3.findAllMeasurements)({
                type: findType,
                measuredAt: { $gt: lastDateTime, $lte: nextDate },
            });
            let condition = stepValues.length > 1 && stepValues.length < 100;
            if (type === "hour") {
                condition = stepValues.length === 12;
            }
            if (condition) {
                let numbers = {};
                for (const measurement of stepValues) {
                    // @ts-ignore
                    const locationId = String(measurement.locationId);
                    if (!numbers[locationId])
                        numbers[locationId] = {
                            temperature: 0,
                            humidity: 0,
                            numberOfMeasurements: 0,
                            nodeId: undefined,
                        };
                    numbers[locationId].temperature += measurement.temperature;
                    numbers[locationId].humidity += measurement.humidity;
                    numbers[locationId].numberOfMeasurements += 1;
                    numbers[locationId].nodeId = measurement.nodeId;
                }
                const keys = Object.keys(numbers);
                for (const key of keys) {
                    const data = numbers[key];
                    let measuredAt = new Date(nextDate);
                    if (type === "day") {
                        measuredAt.setHours(0);
                        measuredAt.setMinutes(0);
                        measuredAt.setSeconds(0);
                    }
                    if (type === "month") {
                        measuredAt = new Date(lastDate);
                        measuredAt.setHours(12);
                    }
                    const newMeasurement = new model_3.MeasurementModel({
                        locationId: key,
                        type,
                        temperature: data.temperature / data.numberOfMeasurements,
                        humidity: data.humidity / data.numberOfMeasurements,
                        measuredAt: measuredAt.toISOString(),
                        nodeId: data.nodeId,
                    });
                    const savedMeasurement = yield newMeasurement.save();
                    savedMeasurements.push(savedMeasurement);
                }
            }
            // Remove all saved and unsaved 5-minutes measurements
            if (findType === "5-minutes" && condition) {
                yield (0, model_3.deleteMeasurementByMultipleIds)(
                // @ts-ignore
                stepValues.map((value) => String(value._id)));
            }
            lastDateTime = nextDate;
            switch (type) {
                case "hour":
                case "day":
                    // @ts-ignore
                    nextDate += incrementBy;
                    break;
                case "month": {
                    const nextDateDate = new Date(nextDate);
                    const numberOfDays = new Date(nextDateDate.getFullYear(), nextDateDate.getMonth() + 1, 0).getDate();
                    nextDate += numberOfDays * 24 * 60 * 60 * 1000;
                    break;
                }
                case "year": {
                    const nextDateDate = new Date(nextDate);
                    const numberOfDays = (0, common_1.daysInYear)(nextDateDate.getFullYear() + 1);
                    nextDate += numberOfDays * 24 * 60 * 60 * 1000;
                }
            }
        }
        console.log(savedMeasurements);
    }
    catch (err) {
        throw err;
    }
});
exports.downscaleData = downscaleData;
const tenHours = 600;
const upscaleData = (timeFrom, timeTo, lowValue, highValue, byMinutes) => {
    const delta = timeTo - timeFrom;
    if (delta > tenHours && byMinutes < 5)
        return [];
    let step = timeFrom + byMinutes * 60;
    const result = [];
    while (step < timeTo) {
        const stepResult = lowValue +
            (step - timeFrom) * ((highValue - lowValue) / (timeTo - timeFrom));
        const date = new Date(step);
        result.push({ value: stepResult, measuredAt: date.toISOString() });
        step += byMinutes * 60;
    }
    return result;
};
exports.upscaleData = upscaleData;
/**
 * Returns buckets with temperature and humidity data for specified date range and granularity (type)
 */
const getBuckets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const dateFrom = new Date(req.query.dateFrom);
        const dateTo = new Date(req.query.dateTo);
        /** get buckets */
        const buckets = yield (0, helpers_1.getBucketsForStation)({
            dateFrom,
            dateTo,
            granularity: req.query.type,
            // @ts-ignore
            locationId: req.params.weatherStationId,
        });
        res.json(buckets);
    }
    catch (err) {
        res.status((_a = err === null || err === void 0 ? void 0 : err.status) !== null && _a !== void 0 ? _a : 500).json({
            error: {
                message: (err === null || err === void 0 ? void 0 : err.message) || "Unknown error",
                status: types_1.StatusCode.SERVER_ERROR,
                code: types_1.ErrorCode.SERVER_ERROR,
            },
        });
    }
});
exports.getBuckets = getBuckets;
/**
 * Returns current (last measured) temperature and humidity for specified weather station
 */
const getCurrent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        /** find most recent weather station measurement */
        const measurement = yield model_3.MeasurementModel.findOne({
            locationId: req.params.locationId,
        }).sort({ measuredAt: -1 });
        /** return null as data since no measurement for the given weather station was found */
        if (!measurement) {
            return res.json({
                date: new Date().toISOString(),
                temperature: null,
                humidity: null,
                todayBuckets: [],
            });
        }
        /** find today's highs/lows from buckets */
        const now = new Date();
        const todayBuckets = yield (0, helpers_1.getBucketsForStation)({
            dateFrom: (0, date_fns_1.subHours)(now, 24),
            dateTo: now,
            granularity: "hour",
            // @ts-ignore
            locationId: req.params.locationId,
        });
        // @ts-ignore
        res.json(Object.assign(Object.assign({ date: measurement.measuredAt.toISOString() }, (0, common_1.pickFrom)(measurement.toJSON(), "temperature", "humidity")), { todayBuckets }));
    }
    catch (err) {
        res.status((_b = err === null || err === void 0 ? void 0 : err.status) !== null && _b !== void 0 ? _b : 500).json({
            error: {
                message: (err === null || err === void 0 ? void 0 : err.message) || "Unknown error",
                status: types_1.StatusCode.SERVER_ERROR,
                code: types_1.ErrorCode.SERVER_ERROR,
            },
        });
    }
});
exports.getCurrent = getCurrent;
