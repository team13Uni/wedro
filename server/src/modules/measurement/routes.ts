import { Router } from "express";
import { validate } from "express-validation";
import { validateAdminJWT, validateJWT } from "../../middlewares";

import * as Controllers from "./controllers";
import {
  createMeasurementValidator,
  updateMeasurementValidator,
} from "./validators";
import { objectIdValidator } from "../../validators";

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

router.delete(
  "/:id",
  validateAdminJWT,
  validate(objectIdValidator),
  Controllers.deleteMeasurement
);

export { router };
