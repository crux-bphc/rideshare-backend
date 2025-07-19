// Create rides
import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { rideMembers, rides, stops } from "@/db/schema/tables.ts";
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
    rideStops,
  } = rideCreateSchema.parse(req.body);

  checkTimes(departureStartTime, departureEndTime, true);

  await db.transaction(async (tx) => {
    const rideId = (await tx.insert(rides).values({
      createdBy: email,
      departureEndTime,
      departureStartTime,
      comments,
      maxMemberCount,
    }).returning())[0].id;

    // Add a `1` indexed ordered location of stops based on the given list of strings corresponding to locations
    await tx.insert(stops).values(rideStops.map((value, index) => {
      return {
        order: index + 1,
        rideId,
        location: value,
      };
    }));

    // Insert the owner as a ride member
    await tx.insert(rideMembers).values({ rideId, userEmail: email });
  });

  res.end();
};

// Create a new ride
router.post("/", asyncHandler(createRide));

export default router;
