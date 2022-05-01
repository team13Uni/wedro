"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const express_validation_1 = require("express-validation");
const middlewares_1 = require("../../middlewares");
const Controllers = __importStar(require("./controllers"));
const validators_1 = require("./validators");
const validators_2 = require("../../validators");
const router = (0, express_1.Router)();
exports.router = router;
router.post("/", middlewares_1.validateAdminJWT, (0, express_validation_1.validate)(validators_1.createMeasurementValidator), Controllers.create);
router.put("/:id", middlewares_1.validateAdminJWT, (0, express_validation_1.validate)(validators_1.updateMeasurementValidator), Controllers.update);
router.get("/", middlewares_1.validateJWT, Controllers.findAll);
router.get("/:id", middlewares_1.validateJWT, (0, express_validation_1.validate)(validators_2.objectIdValidator), Controllers.findOne);
router.delete("/:id", middlewares_1.validateAdminJWT, (0, express_validation_1.validate)(validators_2.objectIdValidator), Controllers.deleteMeasurement);
