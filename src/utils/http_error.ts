import { StatusCodes } from "http-status-codes";

export class HttpError extends Error {
  constructor(
    public code: StatusCodes,
    public msg: string,
    public error?: string,
  ) {
    super(msg);
    // For using instanceof
    Object.setPrototypeOf(this, HttpError.prototype);
    Error.captureStackTrace(this);
  }
}
