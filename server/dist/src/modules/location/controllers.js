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
exports.deleteLocation = exports.findOne = exports.findAll = exports.update = exports.create = void 0;
const common_1 = require("../../helpers/common");
const types_1 = require("../../types");
const model_1 = require("./model");
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newLocation = new model_1.LocationModel(req.body);
        const result = yield newLocation.save();
        res.json(result);
    }
    catch (err) {
        res.status(500).json({
            error: {
                message: err.message,
                status: types_1.StatusCode.SERVER_ERROR,
                code: types_1.ErrorCode.SERVER_ERROR,
            },
        });
    }
});
exports.create = create;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const location = yield (0, model_1.findLocationById)(id);
        if (!location) {
            return res.status(types_1.StatusCode.RECORD_NOT_FOUND).json({
                error: {
                    message: "Location not found",
                    status: types_1.StatusCode.RECORD_NOT_FOUND,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        const updatedLocation = yield (0, model_1.updateLocationById)(id, req.body);
        if (!updatedLocation) {
            return res.status(types_1.StatusCode.SERVER_ERROR).json({
                error: {
                    message: "Error occurred when updating the location, please try again later",
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        res.send(updatedLocation);
    }
    catch (err) {
        res.status(500).json({
            error: {
                message: err.message,
                status: types_1.StatusCode.SERVER_ERROR,
                code: types_1.ErrorCode.SERVER_ERROR,
            },
        });
    }
});
exports.update = update;
const findAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const locations = yield model_1.LocationModel.find().populate("nodeId");
        // @ts-ignore
        const mappedLocations = locations.map((location) => (Object.assign(Object.assign({}, (0, common_1.omitFrom)(location.toJSON(), "nodeId")), { weatherStation: location.nodeId })));
        res.send(mappedLocations);
    }
    catch (err) {
        res.status(500).json({
            error: {
                message: err.message,
                status: types_1.StatusCode.SERVER_ERROR,
                code: types_1.ErrorCode.SERVER_ERROR,
            },
        });
    }
});
exports.findAll = findAll;
const findOne = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const location = yield model_1.LocationModel.findById(req.params.id).populate("nodeId");
        if (!location) {
            return res.status(404).json({
                error: {
                    message: "Location not found",
                    status: types_1.StatusCode.RECORD_NOT_FOUND,
                    code: types_1.ErrorCode.NOT_FOUND,
                },
            });
        }
        // @ts-ignore
        res.send(Object.assign(Object.assign({}, (0, common_1.omitFrom)(location.toJSON(), "nodeId")), { weatherStation: location.nodeId }));
    }
    catch (err) {
        res.status(500).json({
            error: {
                message: err.message,
                status: types_1.StatusCode.SERVER_ERROR,
                code: types_1.ErrorCode.SERVER_ERROR,
            },
        });
    }
});
exports.findOne = findOne;
const deleteLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const location = yield (0, model_1.findLocationById)(id);
        if (!location) {
            return res.status(types_1.StatusCode.RECORD_NOT_FOUND).json({
                error: {
                    message: "Location not found",
                    status: types_1.StatusCode.RECORD_NOT_FOUND,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        const deletedLocation = yield (0, model_1.deleteLocationById)(id);
        if (!deletedLocation) {
            return res.status(types_1.StatusCode.SERVER_ERROR).json({
                error: {
                    message: "Error occurred when deleting the location, please try again later",
                    status: types_1.StatusCode.SERVER_ERROR,
                    code: types_1.ErrorCode.SERVER_ERROR,
                },
            });
        }
        res.send({ success: true });
    }
    catch (err) {
        res.status(500).json({
            error: {
                message: err.message,
                status: types_1.StatusCode.SERVER_ERROR,
                code: types_1.ErrorCode.SERVER_ERROR,
            },
        });
    }
});
exports.deleteLocation = deleteLocation;
