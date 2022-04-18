import { Joi } from "express-validation";

const validators = {
  name: Joi.string(),
  username: Joi.string(),
  password: Joi.string(),
};

export const loginValidator = {
  body: Joi.object({
    username: validators.username.required(),
    password: validators.password.required(),
  }),
};

export const registerValidator = {
  body: Joi.object({
    name: validators.name.required(),
    username: validators.username.required(),
    password: validators.password.required(),
  }),
};
