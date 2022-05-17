import type { NextFunction, Response } from "express";
import { Secret, verify } from "jsonwebtoken";
import { HttpException } from "../exceptions";
import { User, UserRole } from "../modules/user";
import {
  ErrorCode,
  RequestWithNodeId,
  RequestWithUser,
  StatusCode,
} from "../types";

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
  } catch (err: HttpException | any) {
    return res.status(403).send({
      message: "JWT: " + err?.message || "Invalid token",
      code: ErrorCode.NOT_AUTHORIZED,
      status: 403,
    });
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
  } catch (err: Error | any) {
    return res.status(StatusCode.NOT_AUTHORIZED).send({
      status: StatusCode.NOT_AUTHORIZED,
      code: ErrorCode.NOT_AUTHORIZED,
      message: "JWT: " + err?.message || "Invalid token",
    });
  }
};

export const validateNodeJWT = async (
  req: RequestWithNodeId,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      const verifiedToken = await (<{ nodeId: string }>(
        verify(token, process.env.JWT_SECRET as Secret)
      ));

      if (!verifiedToken.nodeId) {
        return res.status(StatusCode.NOT_AUTHORIZED).send({
          status: 403,
          code: ErrorCode.NOT_AUTHORIZED,
          message: "You are not authorized to access this endpoint!",
        });
      }
      req.nodeId = verifiedToken.nodeId;
      next();
    } else {
      return res.status(StatusCode.NOT_AUTHORIZED).send({
        status: 403,
        code: ErrorCode.NOT_AUTHORIZED,
        message: "You are not authorized to access this endpoint!",
      });
    }
  } catch (err: Error | any) {
    return res.status(StatusCode.NOT_AUTHORIZED).send({
      status: StatusCode.NOT_AUTHORIZED,
      code: ErrorCode.NOT_AUTHORIZED,
      message: "JWT: " + err?.message || "Invalid token",
    });
  }
};
