import type { NextFunction, Response, Request } from "express";
import type { IError } from "../exceptions";

export function errorMiddleware(
  error: IError,
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { status: errorStatus, message: errorMessage, ...rest } = error;
  const status = errorStatus || error.statusCode || 500;
  const message = errorMessage || "Something went wrong";

  response.status(status).send({
    status,
    message,
    ...rest,
  });
}
