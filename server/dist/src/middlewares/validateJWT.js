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
exports.validateNodeJWT = exports.validateAdminJWT = exports.validateJWT = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = require("../modules/user");
const types_1 = require("../types");
const exceptions_1 = require("../exceptions");
const validateJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            req.user = yield (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
            next();
        }
        else {
            return res.status(403).send({
                status: 403,
                code: types_1.ErrorCode.NOT_AUTHORIZED,
                message: "You are not authorized to access this endpoint!",
            });
        }
    }
    catch (err) {
        if (err instanceof exceptions_1.HttpException) {
            return res.status(403).send({
                message: "JWT: " + err.message,
                code: types_1.ErrorCode.NOT_AUTHORIZED,
                status: 403,
            });
        }
    }
});
exports.validateJWT = validateJWT;
const validateAdminJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            const user = yield ((0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET));
            if (user.role === user_1.UserRole.ADMIN) {
                req.user = user;
                next();
            }
            else {
                return res.status(types_1.StatusCode.NOT_AUTHORIZED).send({
                    status: types_1.StatusCode.NOT_AUTHORIZED,
                    code: types_1.ErrorCode.NOT_AUTHORIZED,
                    message: "You are not authorized to access this endpoint!",
                });
            }
        }
        else {
            return res.status(types_1.StatusCode.NOT_AUTHORIZED).send({
                status: 403,
                code: types_1.ErrorCode.NOT_AUTHORIZED,
                message: "You are not authorized to access this endpoint!",
            });
        }
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(types_1.StatusCode.NOT_AUTHORIZED).send({
                status: types_1.StatusCode.NOT_AUTHORIZED,
                code: types_1.ErrorCode.NOT_AUTHORIZED,
                message: "JWT: " + err.message,
            });
        }
    }
});
exports.validateAdminJWT = validateAdminJWT;
const validateNodeJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            const verifiedToken = yield ((0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET));
            if (!verifiedToken.nodeId) {
                return res.status(types_1.StatusCode.NOT_AUTHORIZED).send({
                    status: 403,
                    code: types_1.ErrorCode.NOT_AUTHORIZED,
                    message: "You are not authorized to access this endpoint!",
                });
            }
            req.nodeId = verifiedToken.nodeId;
            next();
        }
        else {
            return res.status(types_1.StatusCode.NOT_AUTHORIZED).send({
                status: 403,
                code: types_1.ErrorCode.NOT_AUTHORIZED,
                message: "You are not authorized to access this endpoint!",
            });
        }
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(types_1.StatusCode.NOT_AUTHORIZED).send({
                status: types_1.StatusCode.NOT_AUTHORIZED,
                code: types_1.ErrorCode.NOT_AUTHORIZED,
                message: "JWT: " + err.message,
            });
        }
    }
});
exports.validateNodeJWT = validateNodeJWT;
