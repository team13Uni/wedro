import { Application, Request, Response, Router } from "express";
import { router as AuthRoutes } from "../modules/auth";
import { router as WeatherStationRoutes } from "../modules/weather-station";
import { router as LocationRoutes } from "../modules/location";
import { router as MeasurementRoutes } from "../modules/measurement";

const router = Router();
router.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

export = (app: Application) => {
  app.use("/api/auth", AuthRoutes);
  app.use("/api/weather-station", WeatherStationRoutes);
  app.use("/api/location", LocationRoutes);
  app.use("/api/measurement", MeasurementRoutes);
};
