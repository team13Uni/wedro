import { Joi } from "express-validation";

const validators = {
  name: Joi.string().max(128),
  username: Joi.string().max(256),
  password: Joi.string().min(8).max(64),
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
