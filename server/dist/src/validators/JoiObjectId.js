"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoiObjectId = void 0;
const express_validation_1 = require("express-validation");
const objIdPattern = /^[0-9a-fA-F]{24}$/;
const isValid = (value) => Boolean(value) && !Array.isArray(value) && objIdPattern.test(String(value));
exports.JoiObjectId = express_validation_1.Joi.extend({
    type: "objectId",
    messages: {
        invalid: "It must have a valid ObjectId.",
    },
    validate(value, helpers) {
        if (!isValid(value)) {
            return { value, errors: helpers.error("invalid") };
        }
    },
});
