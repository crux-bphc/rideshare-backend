// Create rides

import express, { Request, Response } from "express";
import { db } from "../../db/client.ts";
import { rideMembers, rides, stops } from "../../db/schema/tables.ts";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { asyncHandler } from "../route_handler.ts";
import { HttpError } from "../../utils/http_error.ts";
import { checkTimes, ISODateString } from "./index.ts";

const router = express.Router();

const rideCreateSchema = z.object({
  departureStartTime: ISODateString,
  departureEndTime: ISODateString,
  comments: z.string().nullable(),
  maxMemberCount: z.int().min(1), // Must have space for at least the owner
  rideStops: z.array(z.string()).min(2), // Must have start and end location
});

const createRide = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) return;

  const {
    departureStartTime,
    departureEndTime,
    comments = "",
    maxMemberCount,
    rideStops,
  } = z.parse(rideCreateSchema, req.body);

  checkTimes(departureStartTime, departureEndTime);

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
