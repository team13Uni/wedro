import { Joi } from "express-validation";
import { JoiObjectId } from "../../validators/JoiObjectId";

const validators = {
  temperature: Joi.number().min(-80).max(80),
  humidity: Joi.number().min(0).max(1),
  measuredAt: Joi.string().max(1024),
  type: Joi.string().valid("hour", "day", "month", "year"),
  nodeId: JoiObjectId.objectId(),
  locationId: JoiObjectId.objectId(),
};

export const createMeasurementValidator = {
  body: Joi.object({
    temperature: validators.temperature.required(),
    humidity: validators.humidity.required(),
    measuredAt: validators.measuredAt.required(),
    type: validators.type.required(),
    nodeId: validators.nodeId.required(),
    locationId: validators.locationId.required(),
  }),
};

export const updateMeasurementValidator = {
  body: Joi.object({
    temperature: validators.temperature,
    humidity: validators.humidity,
    measuredAt: validators.measuredAt,
    type: validators.type,
    nodeId: validators.nodeId,
    locationId: validators.locationId,
  }),
};
