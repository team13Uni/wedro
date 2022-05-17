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
exports.downscaleData = exports.getBucketsForStation = exports.getMeasurementTypeByGranularity = void 0;
const date_fns_1 = require("date-fns");
const common_1 = require("../../helpers/common");
const model_1 = require("./model");
/**
 * Upscale data between buckets
 * @param {BucketData & {type: MeasurementType}} leftBucket
 * @param {BucketData & {type: MeasurementType}} rightBucket
 * @param {"minute" | "5-minutes" | "hour" | "day" | "month"} granularity
 * @returns {BucketData[]}
 */
const upscaleDataBetweenBuckets = ({ leftBucket, rightBucket, granularity, }) => {
    /** granularity of time `minute` and `5-minutes` are currently supported for data up scaling */
    if (!["minute", "5-minutes"].includes(granularity)) {
        return [leftBucket, rightBucket];
    }
    /** check measurement type equality */
    if (leftBucket.type !== rightBucket.type)
        throw new Error("Buckets must have the same type");
    /** check required data */
    // if (!isDefined(rightBucket.humidity) || !isDefined(rightBucket.temperature))
    //   throw new Error("Right bucket must have temperature and humidity.");
    const result = [];
    const minuteStep = granularity === "5-minutes" ? 5 : 1;
    /** calculate deltaMinutes value between the dates */
    const TEN_HOURS = 10 * 60;
    const leftDateTime = leftBucket.date.getTime() / (60 * 1000);
    const rightDateTime = rightBucket.date.getTime() / (60 * 1000);
    const deltaMinutes = rightDateTime - leftDateTime;
    /** check for compatibility */
    if (deltaMinutes > TEN_HOURS && minuteStep < 5)
        throw new Error("Cannot upscale data between buckets. The range is too wide and granularity is too small.");
    /** calculate values for each step */
    let step = leftDateTime + minuteStep;
    while (step < rightDateTime) {
        const temperatureStepRes = (0, common_1.isDefined)(leftBucket.temperature) && (0, common_1.isDefined)(rightBucket.temperature)
            ? leftBucket.temperature +
                (step - leftDateTime) *
                    ((rightBucket.temperature - leftBucket.temperature) /
                        (rightDateTime - leftDateTime))
            : null;
        const humidityStepRes = (0, common_1.isDefined)(leftBucket.humidity) && (0, common_1.isDefined)(rightBucket.humidity)
            ? leftBucket.humidity +
                (step - leftDateTime) *
                    ((rightBucket.humidity - leftBucket.humidity) /
                        (rightDateTime - leftDateTime))
            : null;
        result.push({
            humidity: humidityStepRes,
            temperature: temperatureStepRes,
            date: new Date(step * 60 * 1000),
            isCalculated: true,
        });
        step += minuteStep;
    }
    return result;
};
/**
 * Returns measurement type based on the specified granularity
 * @param {BucketGranularity} granularity
 * @returns {[MeasurementType, boolean]}
 */
const getMeasurementTypeByGranularity = (granularity) => {
    switch (granularity) {
        case "minute":
            return ["hour", true];
        case "5-minutes":
            return ["hour", true];
        default:
            return [granularity, false];
    }
};
exports.getMeasurementTypeByGranularity = getMeasurementTypeByGranularity;
/**
 * Helper function to get buckets for weather station in specified date interval and granularity
 * @author filipditrich
 * @export
 */
const getBucketsForStation = ({ dateFrom, dateTo, granularity, locationId, }) => __awaiter(void 0, void 0, void 0, function* () {
    /** generate buckets */
    let buckets = [];
    switch (granularity) {
        case "minute":
        case "5-minutes":
        case "hour":
            buckets = (0, date_fns_1.eachHourOfInterval)({ start: dateFrom, end: dateTo });
            break;
        case "day":
            buckets = (0, date_fns_1.eachDayOfInterval)({ start: dateFrom, end: dateTo });
            break;
        case "month":
            buckets = (0, date_fns_1.eachMonthOfInterval)({ start: dateFrom, end: dateTo });
            break;
    }
    /** get correct measurement type by requested granularity */
    const [measurementTypeByGranularity, shouldMeasurementsBeUpScaled] = (0, exports.getMeasurementTypeByGranularity)(granularity);
    /** get correct measurements */
    const measurements = yield model_1.MeasurementModel.find({
        locationId: locationId,
        measuredAt: { $gte: dateFrom, $lte: dateTo },
        type: measurementTypeByGranularity,
    });
    /** fill buckets with measurements */
    const bucketsWithMeasurements = buckets.reduce((acc, bucketDate, currentIndex) => {
        const measurement = measurements.find((m) => (0, date_fns_1.isEqual)(new Date(m.toJSON().measuredAt), bucketDate));
        /** upscale missing data if requested */
        if (shouldMeasurementsBeUpScaled) {
            const previousBucketWithMeasurement = acc
                .reverse()
                .find((b) => !b.isCalculated);
            /** upscale data with previous bucket */
            const upScaledData = previousBucketWithMeasurement
                ? upscaleDataBetweenBuckets({
                    leftBucket: {
                        date: previousBucketWithMeasurement.date,
                        temperature: (previousBucketWithMeasurement === null || previousBucketWithMeasurement === void 0 ? void 0 : previousBucketWithMeasurement.temperature) || null,
                        humidity: (previousBucketWithMeasurement === null || previousBucketWithMeasurement === void 0 ? void 0 : previousBucketWithMeasurement.humidity) || null,
                        type: measurementTypeByGranularity,
                    },
                    rightBucket: {
                        date: bucketDate,
                        temperature: (measurement === null || measurement === void 0 ? void 0 : measurement.temperature) || null,
                        humidity: (measurement === null || measurement === void 0 ? void 0 : measurement.humidity) || null,
                        type: measurementTypeByGranularity,
                    },
                    granularity,
                })
                : [];
            return [
                ...acc,
                /** return up scaled data */
                ...upScaledData,
                /** return current bucket */
                {
                    date: bucketDate,
                    temperature: (measurement === null || measurement === void 0 ? void 0 : measurement.temperature) || null,
                    humidity: (measurement === null || measurement === void 0 ? void 0 : measurement.humidity) || null,
                },
            ];
        }
        /** return current/empty bucket */
        return [
            ...acc,
            {
                date: bucketDate,
                temperature: (measurement === null || measurement === void 0 ? void 0 : measurement.temperature) || null,
                humidity: (measurement === null || measurement === void 0 ? void 0 : measurement.humidity) || null,
            },
        ];
    }, []);
    /** send the data */
    return bucketsWithMeasurements.sort((0, common_1.sortBy)("date", { direction: "desc" }));
});
exports.getBucketsForStation = getBucketsForStation;
// =============================================================================
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
