// Kick user out of a ride

import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { rideMembers, userRequests } from "@/db/schema/tables.ts";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import {
  rideDismissSchema,
  rideIDSchema,
} from "@/validators/ride_validators.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { getTokens } from "../../../../utils/notifications.ts";
import { sendToMessageQueue } from "../../../../bullmq/queue.ts";

const router = express.Router();

const dismiss = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const { rideId } = rideIDSchema.parse(req.params);
  const { dismissUserEmail } = rideDismissSchema.parse(req.body);

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

  if (ride.createdBy === dismissUserEmail) {
    throw new HttpError(
      StatusCodes.CONFLICT, // conflict or something else?
      "The current user is the owner of the ride. User cannot dismiss themselves.",
    );
  }

  await db.transaction(async (tx) => {
    // Check if the given user id is in the ride members
    const dismissUser = await db.delete(rideMembers).where(
      and(
        eq(rideMembers.userEmail, dismissUserEmail),
        eq(rideMembers.rideId, rideId),
      ),
    ).returning();

    if (dismissUser.length < 1) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        "The given member was not found!",
      );
    }

    // Remove request
    await tx.delete(userRequests).where(
      and(
        eq(userRequests.userEmail, dismissUserEmail),
        eq(userRequests.rideId, rideId),
      ),
    );
  });

  // Notify requested user about their ride status here
  await sendToMessageQueue(
    `You have been removed`,
    `You were removed from the ride from ${ride.rideStartLocation} to ${ride.rideEndLocation} that departs at ${ride.departureEndTime.toLocaleDateString()}!`,
    await getTokens(dismissUserEmail),
  );

  res.end();
};

router.delete(
  "/:rideId",
  asyncHandler(dismiss),
);

export default router;
