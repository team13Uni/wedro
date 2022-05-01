"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
function errorMiddleware(error, request, response, next) {
    const { status: errorStatus, message: errorMessage } = error, rest = __rest(error, ["status", "message"]);
    const status = errorStatus || error.statusCode || 500;
    const message = errorMessage || "Something went wrong";
    response.status(status).send(Object.assign({ status,
        message }, rest));
}
exports.errorMiddleware = errorMiddleware;
