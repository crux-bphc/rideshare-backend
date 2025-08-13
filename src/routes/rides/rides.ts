// Create rides
import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { rideMembers, rides } from "@/db/schema/tables.ts";
import { asyncHandler } from "../route_handler.ts";
import { checkTimes, rideCreateSchema } from "@/validators/ride_validators.ts";

const router = express.Router();

const createRide = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) return;

  const {
    departureStartTime,
    departureEndTime,
    comments = "",
    maxMemberCount,
    rideStart,
    rideEnd,
  } = rideCreateSchema.parse(req.body);

  checkTimes(departureStartTime, departureEndTime, true);

  await db.transaction(async (tx) => {
    const rideId = (await tx.insert(rides).values({
      createdBy: email,
      departureEndTime: new Date(departureEndTime),
      departureStartTime: new Date(departureStartTime),
      comments,
      maxMemberCount,
      ride_start_location: rideStart,
      ride_end_location: rideEnd,
    }).returning())[0].id;

    // Insert the owner as a ride member
    await tx.insert(rideMembers).values({ rideId, userEmail: email });
  });

  res.end();
};

// Create a new ride
router.post("/", asyncHandler(createRide));

export default router;
