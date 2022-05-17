"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLocationValidator = exports.createLocationValidator = void 0;
const express_validation_1 = require("express-validation");
const JoiObjectId_1 = require("../../validators/JoiObjectId");
const validators = {
    name: express_validation_1.Joi.string().max(512),
    nodeId: JoiObjectId_1.JoiObjectId.objectId(),
    state: express_validation_1.Joi.string().valid("active", ""),
    coordinates: express_validation_1.Joi.array().items(express_validation_1.Joi.number()),
    seaLevel: express_validation_1.Joi.number(),
};
exports.createLocationValidator = {
    body: express_validation_1.Joi.object({
        name: validators.name.required(),
        nodeId: validators.nodeId,
        state: validators.state,
        coordinates: validators.coordinates.required(),
        seaLevel: validators.seaLevel.required(),
    }),
};
exports.updateLocationValidator = {
    params: express_validation_1.Joi.object({
        id: JoiObjectId_1.JoiObjectId.objectId().required(),
    }),
    body: express_validation_1.Joi.object({
        name: validators.name,
        nodeId: validators.nodeId,
        state: validators.state,
        coordinates: validators.coordinates,
        seaLevel: validators.seaLevel,
    }),
};
