"use strict";
const express_1 = require("express");
const auth_1 = require("../modules/auth");
const weather_station_1 = require("../modules/weather-station");
const location_1 = require("../modules/location");
const measurement_1 = require("../modules/measurement");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello world");
});
module.exports = (app) => {
    app.use("/api/auth", auth_1.router);
    app.use("/api/weather-station", weather_station_1.router);
    app.use("/api/location", location_1.router);
    app.use("/api/measurement", measurement_1.router);
};
