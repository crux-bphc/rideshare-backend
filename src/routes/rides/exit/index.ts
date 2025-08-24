// Leave a ride

import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { rideMembers, userRequests } from "@/db/schema/tables.ts";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { rideIDSchema } from "@/validators/ride_validators.ts";

const router = express.Router();

const exit = async (req: Request, res: Response) => {
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

  const member = db.query.rideMembers.findFirst({
    where: (member, { and, eq }) =>
      and(eq(member.rideId, rideId), eq(member.userEmail, email)),
  });

  // Check if the user is in the ride
  if (!member) {
    throw new HttpError(
      StatusCodes.NOT_FOUND,
      "User was not found as a member in the ride!",
    );
  }

  // Check if the user owns the ride
  if (ride.createdBy === email) {
    throw new HttpError(
      StatusCodes.NOT_FOUND,
      "Ride owners cannot leave the ride! Delete the ride instead.",
    );
  }

  await db.transaction(async (tx) => {
    await tx.delete(rideMembers).where(
      and(
        eq(rideMembers.rideId, rideId),
        eq(rideMembers.userEmail, email),
      ),
    );

    await tx.delete(userRequests).where(
      and(
        eq(userRequests.rideId, rideId),
        eq(userRequests.userEmail, email),
      ),
    );
  });

  // Notify the owner of the ride that the user left the ride here

  res.end();
};

router.delete("/:rideId", asyncHandler(exit));

export default router;
