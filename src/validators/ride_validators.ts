import z from "zod";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "@/utils/http_error.ts";

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

export const rideCreateSchema = z.object({
  departureStartTime: ISODateString,
  departureEndTime: ISODateString,
  comments: z.string().nullable(),
  maxMemberCount: z.int().min(1), // Must have space for at least the owner
  rideStops: z.array(z.string()).min(2), // Must have start and end location
});

export const rideDismissSchema = z.object({
  dismissUserEmail: z.string(),
});

export const rideLocationSearchSchema = z.object({ search_query: z.string() });
export const rideTimeSearchSchema = z.object({
  from: ISODateString.optional(),
  by: ISODateString.optional(),
}).refine((query) => {
  return !!query.by !== !!query.from;
});

export const rideManageSchema = z.object({
  requestUserEmail: z.string(),
  status: z.enum(["accepted", "declined"]),
});

export const rideUpdateSchema = z.object({
  departureStartTime: ISODateString.optional(),
  departureEndTime: ISODateString.optional(),
  comments: z.string().nullable().optional(),
  maxMemberCount: z.int().min(1).optional(), // Must have space for at least the owner
  rideStops: z.array(z.string()).min(2).optional(), // Must have start and end location - the whole set of stops must be sent
});
