import { Router } from "express";
import * as Controllers from "./controllers";
import { validate } from "express-validation";
import { loginValidator, registerValidator } from "./validators";

const router = Router();

router.post("/register", validate(registerValidator), Controllers.register);

router.post("/login", validate(loginValidator), Controllers.login);

export { router };
