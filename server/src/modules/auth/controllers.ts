import type { Request } from "express";
import type { Secret } from "jsonwebtoken";
import { sign } from "jsonwebtoken";

import type {
  LoginRequestBody,
  LoginResponseBody,
  RegisterRequestBody,
  RegisterResponseBody,
} from "./types";
import type { ResponseWithError } from "../../types";
import { ErrorCode, StatusCode } from "../../types";
import { createUser, findOneUser, UserRole } from "../user";
import { config } from "../../config";
import { HttpException } from "../../exceptions";

export const login = async (
  req: Request<Record<string, string>, LoginResponseBody, LoginRequestBody>,
  res: ResponseWithError<LoginResponseBody>
) => {
  try {
    const { username, password } = req.body;

    const user = await findOneUser({ username });

    if (user) {
      const passwordMatch = await user.validatePassword(
        password,
        user.password
      );

      if (!passwordMatch)
        return res.status(StatusCode.WRONG_INPUT).send({
          error: {
            code: ErrorCode.WRONG_CREDENTIALS,
            status: StatusCode.WRONG_INPUT,
          },
        });

      const token = sign(
        {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET as Secret,
        { expiresIn: config.tokenExpiration }
      );

      res.send({
        username: user.username,
        role: user.role,
        accessToken: token,
      });
    } else {
      res.status(StatusCode.WRONG_INPUT).json({
        error: {
          status: StatusCode.WRONG_INPUT,
          code: ErrorCode.WRONG_CREDENTIALS,
          message: "Wrong credentials",
        },
      });
    }
  } catch (err) {
    if (err instanceof Error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        error: {
          message: err.message,
          code: ErrorCode.SERVER_ERROR,
          status: StatusCode.SERVER_ERROR,
        },
      });
    }
  }
};

export const register = async (
  req: Request<
    Record<string, string>,
    RegisterResponseBody,
    RegisterRequestBody
  >,
  res: ResponseWithError<RegisterResponseBody>
) => {
  try {
    const user = req.body;

    const foundUserByEmail = await findOneUser({ username: user.username });

    if (foundUserByEmail)
      return res.status(500).json({
        error: {
          message: "User with this username already exists!",
          code: ErrorCode.ALREADY_EXISTS,
          status: 500,
        },
      });

    const savedUser = await createUser({
      ...user,
      role: UserRole.USER,
    });

    res.json({
      user: {
        username: savedUser.username,
        name: savedUser.name,
      },
    });
  } catch (err) {
    if (err instanceof HttpException) {
      return res.status(err.status).send({
        error: {
          message: err.message,
          code: ErrorCode.SERVER_ERROR,
          status: err.status,
        },
      });
    }
  }
};
