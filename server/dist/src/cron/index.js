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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const controllers_1 = require("../modules/weather-station/controllers");
const measurement_1 = require("../modules/measurement");
function default_1() {
    node_cron_1.default.schedule("*/10 * * * *", () => __awaiter(this, void 0, void 0, function* () {
        console.log("cron every 10 minutes");
        const updatedStations = yield (0, controllers_1.wellnessCheck)();
        console.log(updatedStations);
    }));
    // every day
    node_cron_1.default.schedule("0 0 * * *", () => __awaiter(this, void 0, void 0, function* () {
        console.log("cron day");
        const data = yield (0, measurement_1.downscaleData)("day");
        console.log(data);
    }));
    // every month
    node_cron_1.default.schedule("0 0 1 */1 *", () => __awaiter(this, void 0, void 0, function* () {
        console.log("cron month");
        const data = yield (0, measurement_1.downscaleData)("month");
        console.log(data);
    }));
    // every year
    node_cron_1.default.schedule("0 0 0 1 */12 *", () => __awaiter(this, void 0, void 0, function* () {
        console.log("cron year");
        const data = yield (0, measurement_1.downscaleData)("year");
        console.log(data);
    }));
}
exports.default = default_1;
