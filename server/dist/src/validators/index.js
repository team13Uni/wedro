"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectIdValidator = void 0;
const express_validation_1 = require("express-validation");
const JoiObjectId_1 = require("./JoiObjectId");
exports.objectIdValidator = {
    params: express_validation_1.Joi.object({
        id: JoiObjectId_1.JoiObjectId.objectId().required(),
    }),
};
