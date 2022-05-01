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
exports.register = exports.login = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const types_1 = require("../../types");
const user_1 = require("../user");
const config_1 = require("../../config");
const exceptions_1 = require("../../exceptions");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield (0, user_1.findOneUser)({ username });
        if (user) {
            const passwordMatch = yield user.validatePassword(password, user.password);
            if (!passwordMatch)
                return res.status(types_1.StatusCode.WRONG_INPUT).send({
                    error: {
                        code: types_1.ErrorCode.WRONG_CREDENTIALS,
                        status: types_1.StatusCode.WRONG_INPUT,
                    },
                });
            const token = (0, jsonwebtoken_1.sign)({
                id: user._id.toString(),
                username: user.username,
                role: user.role,
            }, process.env.JWT_SECRET, { expiresIn: config_1.config.tokenExpiration });
            res.send({
                username: user.username,
                role: user.role,
                accessToken: token,
            });
        }
        else {
            res.status(types_1.StatusCode.WRONG_INPUT).json({
                error: {
                    status: types_1.StatusCode.WRONG_INPUT,
                    code: types_1.ErrorCode.WRONG_CREDENTIALS,
                    message: "Wrong credentials",
                },
            });
        }
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(types_1.StatusCode.SERVER_ERROR).json({
                error: {
                    message: err.message,
                    code: types_1.ErrorCode.SERVER_ERROR,
                    status: types_1.StatusCode.SERVER_ERROR,
                },
            });
        }
    }
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        const foundUserByEmail = yield (0, user_1.findOneUser)({ username: user.username });
        if (foundUserByEmail)
            return res.status(500).json({
                error: {
                    message: "User with this username already exists!",
                    code: types_1.ErrorCode.ALREADY_EXISTS,
                    status: 500,
                },
            });
        const savedUser = yield (0, user_1.createUser)(Object.assign(Object.assign({}, user), { role: user_1.UserRole.USER }));
        res.json({
            user: {
                username: savedUser.username,
                name: savedUser.name,
            },
        });
    }
    catch (err) {
        if (err instanceof exceptions_1.HttpException) {
            return res.status(err.status).send({
                error: {
                    message: err.message,
                    code: types_1.ErrorCode.SERVER_ERROR,
                    status: err.status,
                },
            });
        }
    }
});
exports.register = register;
