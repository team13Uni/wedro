"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMeasurementValidator = void 0;
const express_validation_1 = require("express-validation");
const validators = {
    temperature: express_validation_1.Joi.number().min(-80).max(80),
    humidity: express_validation_1.Joi.number().min(0).max(1),
    measuredAt: express_validation_1.Joi.number(),
};
exports.createMeasurementValidator = {
    body: express_validation_1.Joi.array()
        .items({
        temperature: validators.temperature.required(),
        humidity: validators.humidity.required(),
        measuredAt: validators.measuredAt.required(),
    })
        .max(700000)
        .min(1),
};
