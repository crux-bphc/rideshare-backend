import z from "zod";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "../../utils/http_error.ts";

export const rideIDSchema = z.object({ rideId: z.coerce.number().int() });
export const ISODateString = z.string().refine(
  (str) => !isNaN(Date.parse(str)),
  {
    message: "Invalid date provided! Expected an ISO date string.",
  },
);

export const checkTimes = (
  startTime: string,
  endTime: string,
  checkNow: boolean,
) => {
  const start = (new Date(startTime)).getTime(),
    end = (new Date(endTime)).getTime(),
    now = Date.now();

  if (end < start || (checkNow ? (start < now || end < now) : false)) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      "Invalid departure start and / or end time!",
    );
  }
};
