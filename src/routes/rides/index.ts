import z from "zod";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "../../utils/http_error.ts";
import request from "./request/index.ts";
import search from "./search/index.ts";
import rides from "./rides.ts";
import exit from "./exit/index.ts";
import deleteRide from "./manage/delete/index.ts";
import dismiss from "./manage/dismiss/index.ts";
import update from "./manage/update/index.ts";
import manageRequest from "./manage/requests/index.ts";

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

export {
  deleteRide,
  dismiss,
  exit,
  manageRequest,
  request,
  rides,
  search,
  update,
};
