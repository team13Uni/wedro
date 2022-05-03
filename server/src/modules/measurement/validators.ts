import { Joi } from "express-validation";

const validators = {
  temperature: Joi.number().min(-80).max(80),
  humidity: Joi.number().min(0).max(1),
  measuredAt: Joi.number(),
};

export const createMeasurementValidator = {
  body: Joi.array()
    .items({
      temperature: validators.temperature.required(),
      humidity: validators.humidity.required(),
      measuredAt: validators.measuredAt.required(),
    })
    .max(100)
    .min(1),
};
