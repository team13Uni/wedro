import { Joi } from "express-validation";
import { JoiObjectId } from "../../validators/JoiObjectId";

const validators = {
  name: Joi.string().max(512),
  secret: Joi.string().max(1024),
  unavailable: Joi.boolean(),
  active: Joi.boolean(),
};

export const createWeatherStationValidator = {
  body: Joi.object({
    name: validators.name.required(),
    secret: validators.secret.required(),
    unavailable: validators.unavailable,
    active: validators.active,
  }),
};

export const updateWeatherStationValidator = {
  params: Joi.object({
    id: JoiObjectId.objectId().required(),
  }),
  body: Joi.object({
    name: validators.name,
    secret: validators.secret,
    unavailable: validators.unavailable,
    active: validators.active,
  }),
};

export const authorizeWeatherStationValidator = {
  body: Joi.object({
    secret: validators.secret,
  }),
};
