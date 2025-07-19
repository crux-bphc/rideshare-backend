// Delete rides

import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { rides } from "@/db/schema/tables.ts";
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { rideIDSchema } from "@/validators/ride_validators.ts";

const router = express.Router();

const deleteRide = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) return;

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

  // Notify ride members, and people who requested the ride that it has been deleted here
  await db.delete(rides).where(eq(rides.id, rideId));

  res.end();
};

// Delete a given ride
router.delete("/:rideId", asyncHandler(deleteRide));

export default router;
