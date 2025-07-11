import { RequestHandler } from "express";
import { z } from "zod";

import { StatusCodes } from "http-status-codes";

export function validateRequest(schema: z.ZodObject<any, any>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (result.success) {
      next();
    } else {
      const err: z.ZodError = result.error;
      const formatted = z.flattenError(err);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid Request Provided",
        errors: formatted,
      });
    }
  };
}
