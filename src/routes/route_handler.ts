import type express from "express";
import { StatusCodes } from "http-status-codes";
import type core from "express-serve-static-core";
import { HttpError } from "@/utils/http_error.ts";
import { fromError, isZodErrorLike } from "zod-validation-error/v4";

export const asyncHandler = <
  P = core.ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = core.Query,
>(
  fn: (
    ...args: Parameters<
      express.RequestHandler<P, ResBody, ReqBody, ReqQuery>
    >
  ) => void | Promise<void>,
): express.RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return function asyncUtilWrap(
    ...args: Parameters<
      express.RequestHandler<P, ResBody, ReqBody, ReqQuery>
    >
  ) {
    const fnReturn = fn(...args);
    const response = args[args.length - 2] as express.Response;
    return Promise.resolve(fnReturn).catch((e) => {
      if (isZodErrorLike(e)) {
        response.status(StatusCodes.BAD_REQUEST).json({
          message: fromError(e).toString(),
        });
      } else if (e instanceof HttpError) {
        response.status(e.code).json({ message: e.message });
      } else {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: `An internal error occured! ${(e as Error).message}`,
        });
      }
    });
  };
};
