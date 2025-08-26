import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { StatusCodes } from "http-status-codes";
import { rideIDSchema } from "../../../validators/ride_validators.ts";
import { rides, userBookmarks } from "@/db/schema/tables.ts";
import { eq } from "drizzle-orm";

const router = express.Router();

const createBookmark = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }
  const { rideId } = rideIDSchema.parse(req.params);

  const ride = await db.query.rides.findFirst({
    where: (rides, { eq }) => eq(rides.id, rideId),
  });

  if (!ride) {
    throw new HttpError(StatusCodes.NOT_FOUND, "Invalid ID provided");
  }

  db.insert(userBookmarks).values(
    {
      userEmail: email,
      rideId,
    },
  );

  res.status(200).json({ message: "Bookmark Created Successfully." });
};

const getBookmarks = async (_req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const found_rides = await db.select({
    id: rides.id,
    createdBy: rides.createdBy,
    comments: rides.comments,
    departureStartTime: rides.departureStartTime,
    departureEndTime: rides.departureEndTime,
    maxMemberCount: rides.maxMemberCount,
    rideStartLocation: rides.rideStartLocation,
    rideEndLocation: rides.rideEndLocation,
  })
    .from(userBookmarks)
    .where(eq(userBookmarks.userEmail, email))
    .innerJoin(rides, eq(rides.id, userBookmarks.rideId));

  if (!found_rides.length) {
    new HttpError(StatusCodes.NOT_FOUND, "No bookmarks for this user.");
  }

  res.status(200).json(found_rides);
};

router.post("/create/:rideId", asyncHandler(createBookmark));
router.get("/get", asyncHandler(getBookmarks));

export default router;
