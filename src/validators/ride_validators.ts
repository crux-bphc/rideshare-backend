import z from "zod";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "@/utils/http_error.ts";

export const rideIDSchema = z.object({ rideId: z.coerce.number().int() });

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
  departureStartTime: z.iso.datetime({ local: true }),
  departureEndTime: z.iso.datetime({ local: true }),
  comments: z.string().nullable(),
  maxMemberCount: z.int().min(1), // Must have space for at least the owner
  rideStartLocation: z.string(),
  rideEndLocation: z.string(),
});

export const rideDismissSchema = z.object({
  dismissUserEmail: z.string(),
});

export const rideSearchSchema = z.object({
  searchStartLocation: z.string(),
  searchEndLocation: z.string(),
  from: z.iso.datetime({ local: true }).optional(),
  by: z.iso.datetime({ local: true }).optional(),
}).refine((query) => {
  return (query.by && !query.from) || (!query.by && query.from);
});

export const rideRequestManageSchema = z.object({
  requestUserEmail: z.string(),
  status: z.enum(["accepted", "declined"]),
});

export const rideUpdateSchema = z.object({
  departureStartTime: z.iso.datetime({ local: true }).optional(),
  departureEndTime: z.iso.datetime({ local: true }).optional(),
  comments: z.string().nullable().optional(),
  maxMemberCount: z.int().min(1).optional(), // Must have space for at least the owner
  rideStartLocation: z.string().optional(),
  rideEndLocation: z.string().optional(), // Must have start and end location - the whole set of stops must be sent
});
