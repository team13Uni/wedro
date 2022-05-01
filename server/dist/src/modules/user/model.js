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
exports.deleteUserById = exports.findUsersWithoutSensitiveInfo = exports.findUserByIdWithoutSensitiveInfo = exports.findUserById = exports.updateUserById = exports.findOneUser = exports.createUser = exports.updateUser = exports.UserModel = exports.userSchema = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
const types_1 = require("./types");
exports.userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: [types_1.UserRole.USER, types_1.UserRole.ADMIN],
        required: true,
        default: types_1.UserRole.USER,
    },
    password: {
        type: String,
        required: true,
    },
});
exports.userSchema.pre("save", function save(next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        try {
            const salt = yield (0, bcrypt_1.genSalt)(10);
            const savedPassword = this.get("password");
            const password = yield (0, bcrypt_1.hash)(savedPassword, salt);
            this.set("password", password);
            return next();
        }
        catch (err) {
            // @ts-ignore
            return next(err);
        }
    });
});
exports.userSchema.methods.validatePassword = (passwordCandidate, storedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, bcrypt_1.compare)(passwordCandidate, storedPassword);
});
exports.UserModel = (0, mongoose_1.model)("user", exports.userSchema);
const updateUser = (filter, update, options) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.UserModel.updateOne(filter, update, options); });
exports.updateUser = updateUser;
const createUser = (userBody) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = new exports.UserModel(userBody);
    return yield newUser.save();
});
exports.createUser = createUser;
const findOneUser = (props) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.UserModel.findOne(props); });
exports.findOneUser = findOneUser;
const updateUserById = (id, newUser) => __awaiter(void 0, void 0, void 0, function* () {
    return yield exports.UserModel.findByIdAndUpdate(id, newUser, {
        useFindAndModify: true,
        new: true,
    });
});
exports.updateUserById = updateUserById;
const findUserById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.UserModel.findById(id); });
exports.findUserById = findUserById;
const findUserByIdWithoutSensitiveInfo = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield exports.UserModel.findById(id).select({
        _id: 1,
        name: 1,
        username: 1,
    });
});
exports.findUserByIdWithoutSensitiveInfo = findUserByIdWithoutSensitiveInfo;
const findUsersWithoutSensitiveInfo = () => __awaiter(void 0, void 0, void 0, function* () { return yield exports.UserModel.find().select({ _id: 1, name: 1, username: 1 }); });
exports.findUsersWithoutSensitiveInfo = findUsersWithoutSensitiveInfo;
const deleteUserById = (id) => __awaiter(void 0, void 0, void 0, function* () { return yield exports.UserModel.findByIdAndDelete(id); });
exports.deleteUserById = deleteUserById;
