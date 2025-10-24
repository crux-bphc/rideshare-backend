// Delete rides

import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { rides } from "@/db/schema/tables.ts";
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { rideIDSchema } from "@/validators/ride_validators.ts";
import { getMemberTokens, getTokens } from "../../../../utils/notifications.ts";
import { sendToMessageQueue } from "../../../../bullmq/queue.ts";

const router = express.Router();

const deleteRide = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const { rideId } = rideIDSchema.parse(req.params);

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
      "The current user cannot delete the ride! User is not the owner of the ride.",
    );
  }

  await sendToMessageQueue(
    `Your ride has been deleted!`,
    `Your ride from ${ride.rideStartLocation} to ${ride.rideEndLocation} that departs at ${ride.departureEndTime.toLocaleDateString()} was deleted by the owner! Look for similar rides in the app!`,
    await getMemberTokens(ride.id, ride.createdBy),
  );

  await db.delete(rides).where(eq(rides.id, rideId));

  res.end();
};

// Delete a given ride
router.delete("/:rideId", asyncHandler(deleteRide));

export default router;
