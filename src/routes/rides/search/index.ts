// Searching
import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { rides, userBookmarks } from "@/db/schema/tables.ts";
import { rideSearchSchema } from "@/validators/ride_validators.ts";
import { and, asc, between, desc, eq, gt, sql } from "drizzle-orm";
import { HttpError } from "@/utils/http_error.ts";
import { StatusCodes } from "http-status-codes";
import { rideResponseObject } from "../../../utils/response_schemas.ts";

const router = express.Router();

const searchRides = async (req: Request, res: Response) => {
  const { searchStartLocation: start, searchEndLocation: end, by, from } =
    rideSearchSchema.parse(
      req.query,
    );

  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }
  // Time search

  const tolerance = 1000 * 60 * 60; //One Hour
  const timeCheck = from ?? by;

  if (!timeCheck) throw new HttpError(404, "Invalid Arguments Provided");
  const time = new Date(timeCheck).getTime();
  const condition = between(
    from ? rides.departureStartTime : rides.departureEndTime,
    new Date(time - tolerance),
    new Date(time + tolerance),
  );
  const order = asc(
    sql`abs(extract(epoch from (${
      from ? rides.departureStartTime : rides.departureEndTime
    } - ${timeCheck})))`,
  );

  // Location search

  const similarityStart = sql<
    number
  >`similarity(${rides.rideStartLocation}, ${start})`;
  const similarityEnd = sql<
    number
  >`similarity(${rides.rideEndLocation}, ${end})`;

  const found_rides = await db.select(rideResponseObject).from(rides).where(
    and(gt(similarityStart, 0), gt(similarityEnd, 0), condition),
  )
    .leftJoin(
      userBookmarks,
      and(
        eq(userBookmarks.rideId, rides.id),
        eq(userBookmarks.userEmail, email),
      ),
    )
    .orderBy(desc(sql`greatest(${similarityEnd}, ${similarityStart})`), order);

  res.json(found_rides);
};

router.get("/", asyncHandler(searchRides));

export default router;
