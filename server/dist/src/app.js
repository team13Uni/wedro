"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const cron_1 = __importDefault(require("./cron"));
const middlewares_1 = require("./middlewares");
require("dotenv").config();
const app = (0, express_1.default)();
(0, cron_1.default)();
app.set("port", process.env.PORT);
app.use((0, morgan_1.default)("combined"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
mongoose_1.default
    .connect(`mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_PASSWORD}@cluster0.vjg7h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
    .then(() => console.log("✅ Successfully connected to MongoDB"))
    .catch((err) => {
    console.log("🆘 Error occured: " + err.message);
    process.exit(1);
});
require("./routes")(app);
// Handle 404 errors
app.use(middlewares_1.errorMiddleware);
app.listen(app.get("port"), () => {
    console.log(`✅ Server is running on port ${app.get("port")}`);
});
