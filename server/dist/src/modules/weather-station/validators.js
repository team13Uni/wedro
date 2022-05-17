"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeWeatherStationValidator = exports.updateWeatherStationValidator = exports.createWeatherStationValidator = void 0;
const express_validation_1 = require("express-validation");
const JoiObjectId_1 = require("../../validators/JoiObjectId");
const validators = {
    name: express_validation_1.Joi.string().max(512),
    secret: express_validation_1.Joi.string().max(1024),
    unavailable: express_validation_1.Joi.boolean(),
    active: express_validation_1.Joi.boolean(),
    location: express_validation_1.Joi.object({
        coordinates: express_validation_1.Joi.array().items(express_validation_1.Joi.number()),
        type: express_validation_1.Joi.string().valid("Point"),
    }),
    seaLevel: express_validation_1.Joi.number(),
};
exports.createWeatherStationValidator = {
    body: express_validation_1.Joi.object({
        name: validators.name.required(),
        secret: validators.secret.required(),
        unavailable: validators.unavailable,
        active: validators.active,
        location: validators.location,
        seaLevel: validators.seaLevel,
    }),
};
exports.updateWeatherStationValidator = {
    params: express_validation_1.Joi.object({
        id: JoiObjectId_1.JoiObjectId.objectId().required(),
    }),
    body: express_validation_1.Joi.object({
        name: validators.name,
        secret: validators.secret,
        unavailable: validators.unavailable,
        active: validators.active,
    }),
};
exports.authorizeWeatherStationValidator = {
    body: express_validation_1.Joi.object({
        secret: validators.secret,
    }),
};
