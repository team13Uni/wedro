"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMeasurementValidator = exports.createMeasurementValidator = void 0;
const express_validation_1 = require("express-validation");
const JoiObjectId_1 = require("../../validators/JoiObjectId");
const validators = {
    temperature: express_validation_1.Joi.number().min(-80).max(80),
    humidity: express_validation_1.Joi.number().min(0).max(1),
    measuredAt: express_validation_1.Joi.string().max(1024),
    type: express_validation_1.Joi.string().valid("hour", "day", "month", "year"),
    nodeId: JoiObjectId_1.JoiObjectId.objectId(),
    locationId: JoiObjectId_1.JoiObjectId.objectId(),
};
exports.createMeasurementValidator = {
    body: express_validation_1.Joi.object({
        temperature: validators.temperature.required(),
        humidity: validators.humidity.required(),
        measuredAt: validators.measuredAt.required(),
        type: validators.type.required(),
        nodeId: validators.nodeId.required(),
        locationId: validators.locationId.required(),
    }),
};
exports.updateMeasurementValidator = {
    body: express_validation_1.Joi.object({
        temperature: validators.temperature,
        humidity: validators.humidity,
        measuredAt: validators.measuredAt,
        type: validators.type,
        nodeId: validators.nodeId,
        locationId: validators.locationId,
    }),
};
