import { Joi } from "express-validation";
import { JoiObjectId } from "../../validators/JoiObjectId";

const validators = {
  name: Joi.string().max(512),
  nodeId: JoiObjectId.objectId(),
  state: Joi.string().valid("active", ""),
  coordinates: Joi.array().items(Joi.number()),
  seaLevel: Joi.number(),
};

export const createLocationValidator = {
  body: Joi.object({
    name: validators.name.required(),
    nodeId: validators.nodeId,
    state: validators.state,
    coordinates: validators.coordinates.required(),
    seaLevel: validators.seaLevel.required(),
  }),
};

export const updateLocationValidator = {
  params: Joi.object({
    id: JoiObjectId.objectId().required(),
  }),
  body: Joi.object({
    name: validators.name,
    nodeId: validators.nodeId,
    state: validators.state,
    coordinates: validators.coordinates,
    seaLevel: validators.seaLevel,
  }),
};
