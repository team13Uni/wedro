export enum StatusCode {
  SUCCESS = 200,
  WRONG_INPUT = 401,
  RECORD_NOT_FOUND = 404,
  SERVER_ERROR = 500,
  NOT_AUTHORIZED = 403,
}

export enum ErrorCode {
  WRONG_CREDENTIALS = "wrong_credentials",
  SERVER_ERROR = "server_error",
  NOT_FOUND = "not_found",
  NOT_AUTHORIZED = "not_authorized",
  ALREADY_EXISTS = "already_exists",
}
