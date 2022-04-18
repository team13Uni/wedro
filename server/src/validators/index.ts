import { Joi } from "express-validation";
import { JoiObjectId } from "./JoiObjectId";

export const objectIdValidator = {
  params: Joi.object({
    id: JoiObjectId.objectId().required(),
  }),
};
