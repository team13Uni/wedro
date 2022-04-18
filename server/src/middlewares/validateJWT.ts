import { Secret, verify } from "jsonwebtoken";
import { User, UserRole } from "../modules/user";
import type { NextFunction, Response } from "express";
import { ErrorCode, RequestWithUser, StatusCode } from "../types";
import { HttpException } from "../exceptions";

export const validateJWT = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      req.user = await (<User>verify(token, process.env.JWT_SECRET as Secret));

      next();
    } else {
      return res.status(403).send({
        status: 403,
        code: ErrorCode.NOT_AUTHORIZED,
        message: "You are not authorized to access this endpoint!",
      });
    }
  } catch (err) {
    if (err instanceof HttpException) {
      return res.status(403).send({
        message: "JWT: " + err.message,
        code: ErrorCode.NOT_AUTHORIZED,
        status: 403,
      });
    }
  }
};

export const validateAdminJWT = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      const user = await (<User>(
        verify(token, process.env.JWT_SECRET as Secret)
      ));

      if (user.role === UserRole.ADMIN) {
        req.user = user;
        next();
      } else {
        return res.status(StatusCode.NOT_AUTHORIZED).send({
          status: StatusCode.NOT_AUTHORIZED,
          code: ErrorCode.NOT_AUTHORIZED,
          message: "You are not authorized to access this endpoint!",
        });
      }
    } else {
      return res.status(StatusCode.NOT_AUTHORIZED).send({
        status: 403,
        code: ErrorCode.NOT_AUTHORIZED,
        message: "You are not authorized to access this endpoint!",
      });
    }
  } catch (err) {
    if (err instanceof Error) {
      return res.status(StatusCode.NOT_AUTHORIZED).send({
        status: StatusCode.NOT_AUTHORIZED,
        code: ErrorCode.NOT_AUTHORIZED,
        message: "JWT: " + err.message,
      });
    }
  }
};
