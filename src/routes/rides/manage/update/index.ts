// Update ride data

import express, { Request, Response } from "express";
import { db } from "../../../../db/client.ts";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { checkTimes, ISODateString, rideIDSchema } from "../../index.ts";
import { asyncHandler } from "../../../route_handler.ts";
import { HttpError } from "../../../../utils/http_error.ts";
import { rides, stops } from "../../../../db/schema/tables.ts";
import { and, eq } from "drizzle-orm";

const router = express.Router();

const rideUpdateSchema = z.object({
  departureStartTime: ISODateString.optional(),
  departureEndTime: ISODateString.optional(),
  comments: z.string().nullable().optional(),
  maxMemberCount: z.int().min(1).optional(), // Must have space for at least the owner
  rideStops: z.array(z.string()).min(2).optional(), // Must have start and end location - the whole set of stops must be sent
});

const update = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) return;

  const { rideId } = z.parse(rideIDSchema, req.params);

  const rideUpdateDetails = z.parse(rideUpdateSchema, req.body);

  if (Object.keys(rideUpdateDetails).length === 0) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      "No fields provided to update!",
    );
  }

  const {
    departureStartTime,
    departureEndTime,
    comments,
    maxMemberCount,
    rideStops,
  } = rideUpdateDetails;

  const ride = await db.query.rides.findFirst({
    where: (rides, { eq }) => eq(rides.id, rideId),
  });

  if (!ride) {
    throw new HttpError(StatusCodes.NOT_FOUND, "The given ride was not found!");
  }

  // Check if the ride actually belongs to the user
  if (ride.createdBy !== email) {
    throw new HttpError(
      StatusCodes.UNAUTHORIZED,
      "The current user cannot change the given ride data! User is not the owner of the ride.",
    );
  }

  // If the time has been updated, check it to make sure the new start time and end times are not reversed
  checkTimes(
    departureStartTime ?? ride.departureStartTime!,
    departureEndTime ?? ride.departureEndTime!,
    false,
  );

  // Check if member count is more than max member count
  if (maxMemberCount) {
    const members = await db.query.rideMembers.findMany({
      where: (members, { eq }) => eq(members.rideId, rideId),
    });

    if (maxMemberCount < members.length) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        "Cannot update ride with max member count less than current member count! Dismiss someone from the ride to reduce the max member count.",
      );
    }
  }

  await db.transaction(async (tx) => {
    // Update stops
    if (rideStops) {
      for (const [index, stop] of rideStops.entries()) {
        await tx.update(stops).set({ location: stop }).where(
          and(eq(stops.rideId, rideId), eq(stops.order, index + 1)),
        );
      }
    }

    // Not sending any value will not update the field
    await tx.update(rides).set({
      departureEndTime,
      departureStartTime,
      comments,
      maxMemberCount,
    }).where(
      eq(rides.id, rideId),
    );
  });

  res.end();
};

router.put(
  "/:rideId",
  asyncHandler(update),
);

export default router;
