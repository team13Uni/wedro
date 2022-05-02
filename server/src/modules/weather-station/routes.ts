import { Router } from "express";
import { validate } from "express-validation";
import {
  validateAdminJWT,
  validateNodeJWT,
  validateJWT,
} from "../../middlewares";
import { objectIdValidator } from "../../validators";
import {
  authorizeWeatherStationValidator,
  createWeatherStationValidator,
  updateWeatherStationValidator,
} from "./validators";
import * as Controllers from "./controllers";

const router = Router();

router.post(
  "/",
  validateAdminJWT,
  validate(createWeatherStationValidator),
  Controllers.create
);

router.put(
  "/:id",
  validateAdminJWT,
  validate(updateWeatherStationValidator),
  Controllers.update
);

router.get("/", validateJWT, Controllers.findAll);

router.get(
  "/:id",
  validateJWT,
  validate(objectIdValidator),
  Controllers.findOne
);

router.post(
  "/authorize",
  validate(authorizeWeatherStationValidator),
  Controllers.authorizeWeatherStation
);

router.delete(
  "/:id",
  validateAdminJWT,
  validate(objectIdValidator),
  Controllers.deleteWeatherStation
);

export { router };
