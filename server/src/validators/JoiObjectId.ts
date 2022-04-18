import { Joi } from "express-validation";

const objIdPattern = /^[0-9a-fA-F]{24}$/;
const isValid = (value: any) =>
  Boolean(value) && !Array.isArray(value) && objIdPattern.test(String(value));

export const JoiObjectId = Joi.extend({
  type: "objectId",
  messages: {
    invalid: "It must have a valid ObjectId.",
  },
  validate(value: any, helpers) {
    if (!isValid(value)) {
      return { value, errors: helpers.error("invalid") };
    }
  },
});
