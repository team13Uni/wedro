import { Router } from "express";
import { validate } from "express-validation";
import {
  validateAdminJWT,
  validateNodeJWT,
  validateJWT,
} from "../../middlewares";

import * as Controllers from "./controllers";
import { createMeasurementValidator } from "./validators";
import { objectIdValidator } from "../../validators";

const router = Router();

router.post(
  "/",
  validateNodeJWT,
  validate(createMeasurementValidator),
  Controllers.create
);

router.get("/", validateJWT, Controllers.findAll);

router.get(
  "/:id",
  validateJWT,
  validate(objectIdValidator),
  Controllers.findOne
);

/** TODO: validate params and query */
router.get(
  "/:weatherStationId/buckets",
  validateJWT,
  Controllers.getBuckets
);

router.delete(
  "/:id",
  validateAdminJWT,
  validate(objectIdValidator),
  Controllers.deleteMeasurement
);

export { router };
