import { Router } from "express";
import { validate } from "express-validation";
import { validateAdminJWT, validateJWT } from "../../middlewares";

import * as Controllers from "./controllers";
import { createLocationValidator, updateLocationValidator } from "./validators";
import { objectIdValidator } from "../../validators";

const router = Router();

router.post(
  "/",
  validateAdminJWT,
  validate(createLocationValidator),
  Controllers.create
);

router.put(
  "/:id",
  validateAdminJWT,
  validate(updateLocationValidator),
  Controllers.update
);

router.get(
  "/:id",
  validateJWT,
  validate(objectIdValidator),
  Controllers.findOne
);

router.get("/", validateJWT, Controllers.findAll);

router.delete(
  "/:id",
  validateAdminJWT,
  validate(objectIdValidator),
  Controllers.deleteLocation
);

export { router };
