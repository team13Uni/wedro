"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidator = exports.loginValidator = void 0;
const express_validation_1 = require("express-validation");
const validators = {
    name: express_validation_1.Joi.string(),
    username: express_validation_1.Joi.string(),
    password: express_validation_1.Joi.string(),
};
exports.loginValidator = {
    body: express_validation_1.Joi.object({
        username: validators.username.required(),
        password: validators.password.required(),
    }),
};
exports.registerValidator = {
    body: express_validation_1.Joi.object({
        name: validators.name.required(),
        username: validators.username.required(),
        password: validators.password.required(),
    }),
};
