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
const mongoose_1 = __importDefault(require("mongoose"));
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const user_1 = require("../modules/user");
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).argv;
function generateAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username } = argv;
            mongoose_1.default.connect(
            // `mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_PASSWORD}@cluster0.vjg7h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
            `mongodb://localhost`);
            yield user_1.UserModel.findOneAndUpdate({ username }, { role: user_1.UserRole.ADMIN });
            console.log("Success");
        }
        catch (err) {
            throw err;
        }
    });
}
generateAdmin();
// Upsampling -> linearní interpolací
