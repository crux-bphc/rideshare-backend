// Create rides
import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { rideMembers, rides } from "@/db/schema/tables.ts";
import { asyncHandler } from "../route_handler.ts";
import {
  checkTimes,
  rideCreateSchema,
  rideIDSchema,
} from "@/validators/ride_validators.ts";
import { HttpError } from "../../utils/http_error.ts";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

const createRide = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const {
    departureStartTime,
    departureEndTime,
    comments = "",
    maxMemberCount,
    rideStartLocation,
    rideEndLocation,
  } = rideCreateSchema.parse(req.body);

  checkTimes(departureStartTime, departureEndTime, true);

  await db.transaction(async (tx) => {
    const rideId = (await tx.insert(rides).values({
      createdBy: email,
      departureEndTime: new Date(departureEndTime),
      departureStartTime: new Date(departureStartTime),
      comments,
      maxMemberCount,
      rideStartLocation,
      rideEndLocation,
    }).returning())[0].id;

    // Insert the owner as a ride member
    await tx.insert(rideMembers).values({ rideId, userEmail: email });
  });

  res.end();
};

const getRide = async (req: Request, res: Response) => {
  const { rideId } = rideIDSchema.parse(req.params);
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const bookmarked = await db.query.userBookmarks.findFirst({
    where: (bookmark, { eq, and }) =>
      and(eq(bookmark.rideId, rideId), eq(bookmark.userEmail, email)),
  });
  const ride = await db.query.rides.findFirst({
    where: (rides, { eq }) => eq(rides.id, rideId),
  });

  if (!ride) throw new HttpError(StatusCodes.NOT_FOUND, "Ride Not Found");

  res.json({
    ...ride,
    isBookmarked: bookmarked !== undefined,
  });
};

// Create a new ride
router.post("/create/", asyncHandler(createRide));
router.get("/get/:rideId", asyncHandler(getRide));

export default router;
