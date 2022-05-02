import { Router } from "express";
import { validate } from "express-validation";
import { validateAdminJWT, validateJWT } from "../../middlewares";
import { objectIdValidator } from "../../validators";

import * as Controllers from "./controllers";
import {
  createMeasurementValidator,
  updateMeasurementValidator,
} from "./validators";

const router = Router();

router.post(
  "/",
  validateAdminJWT,
  validate(createMeasurementValidator),
  Controllers.create
);

router.put(
  "/:id",
  validateAdminJWT,
  validate(updateMeasurementValidator),
  Controllers.update
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
