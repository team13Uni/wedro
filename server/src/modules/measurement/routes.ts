import { Router } from "express";
import { validate } from "express-validation";
import {
  validateAdminJWT,
  validateNodeJWT,
  validateJWT,
} from "../../middlewares";

import * as Controllers from "./controllers";
import { objectIdValidator } from "../../validators";
import { createMeasurementValidator } from "./validators";

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
router.get("/:weatherStationId/buckets", validateJWT, Controllers.getBuckets);

/** TODO: validate params and query */
router.get(
    "/:weatherStationId/current",
    validateJWT,
    Controllers.getCurrent
);

router.delete(
  "/:id",
  validateAdminJWT,
  validate(objectIdValidator),
  Controllers.deleteMeasurement
);

export { router };
