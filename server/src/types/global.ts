import type { Request, Response } from "express";
import type { Query } from "express-serve-static-core";
import type { User } from "../modules/user";
import type { StatusCode, ErrorCode } from "./errors";

export type Error = {
  message?: string;
  code: ErrorCode;
  status: StatusCode;
};

export type ResponseWithError<
  ResBody = Record<string, string>,
  Locales extends Record<string, any> = Record<string, any>
> = Response<ResBody | { error?: Error }, Locales>;

export type RequestWithUser<
  P extends Record<string, string> = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  Locals extends Record<string, any> = Record<string, any>
> = Request<P, ResBody, ReqBody, ReqQuery, Locals> & { user?: User };

export type IdParam = {
  id: string;
};
