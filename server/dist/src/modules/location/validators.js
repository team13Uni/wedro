"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLocationValidator = exports.createLocationValidator = void 0;
const express_validation_1 = require("express-validation");
const JoiObjectId_1 = require("../../validators/JoiObjectId");
const validators = {
    name: express_validation_1.Joi.string().max(512),
    nodeId: JoiObjectId_1.JoiObjectId.objectId(),
    state: express_validation_1.Joi.string().valid("active", ""),
};
exports.createLocationValidator = {
    body: express_validation_1.Joi.object({
        name: validators.name.required(),
        nodeId: validators.nodeId.required(),
        state: validators.state,
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
    }),
};
