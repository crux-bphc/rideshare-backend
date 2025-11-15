// Update ride data

import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { StatusCodes } from "http-status-codes";
import {
  checkTimes,
  rideIDSchema,
  rideUpdateSchema,
} from "@/validators/ride_validators.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { rides } from "@/db/schema/tables.ts";
import { eq } from "drizzle-orm";
import { sendToMessageQueue } from "../../../../bullmq/queue.ts";
import { getMemberTokens } from "../../../../utils/notifications.ts";

const router = express.Router();

const update = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const { rideId } = rideIDSchema.parse(req.params);

  const rideUpdateDetails = rideUpdateSchema.parse(req.body);

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
    rideStartLocation,
    rideEndLocation,
  } = rideUpdateDetails;

  const ride = await db.query.rides.findFirst({
    where: (rides, { eq }) => eq(rides.id, rideId),
    with: { user: { columns: { name: true } } },
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
    departureStartTime ?? ride.departureStartTime!.toISOString(),
    departureEndTime ?? ride.departureEndTime!.toISOString(),
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
    if (rideStartLocation || rideEndLocation) {
      // Update ride stops
      await tx.update(rides).set({
        rideStartLocation: rideStartLocation,
        rideEndLocation: rideEndLocation,
      }).where(
        eq(rides.id, rideId),
      );
    }

    // Not sending any value will not update the field
    await tx.update(rides).set({
      departureEndTime: departureEndTime
        ? new Date(departureEndTime)
        : undefined,
      departureStartTime: departureStartTime
        ? new Date(departureStartTime)
        : undefined,
      comments,
      maxMemberCount,
    }).where(
      eq(rides.id, rideId),
    );
  });

  await sendToMessageQueue(
    `Your ride has been updated`,
    // TODO?: Ideally the user should click the notif and it should redirect to theride
    `The ride created by ${ride.user.name} from ${ride.rideStartLocation} to ${ride.rideEndLocation} that departs at ${ride.departureEndTime.toLocaleDateString()} has been updated. Check the app for updated details`,
    await getMemberTokens(ride.id, ride.createdBy),
  );

  res.end();
};

router.put(
  "/:rideId",
  asyncHandler(update),
);

export default router;
