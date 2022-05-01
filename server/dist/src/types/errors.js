"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.StatusCode = void 0;
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["SUCCESS"] = 200] = "SUCCESS";
    StatusCode[StatusCode["WRONG_INPUT"] = 401] = "WRONG_INPUT";
    StatusCode[StatusCode["RECORD_NOT_FOUND"] = 404] = "RECORD_NOT_FOUND";
    StatusCode[StatusCode["SERVER_ERROR"] = 500] = "SERVER_ERROR";
    StatusCode[StatusCode["NOT_AUTHORIZED"] = 403] = "NOT_AUTHORIZED";
})(StatusCode = exports.StatusCode || (exports.StatusCode = {}));
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["WRONG_CREDENTIALS"] = "wrong_credentials";
    ErrorCode["SERVER_ERROR"] = "server_error";
    ErrorCode["NOT_FOUND"] = "not_found";
    ErrorCode["NOT_AUTHORIZED"] = "not_authorized";
    ErrorCode["ALREADY_EXISTS"] = "already_exists";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
