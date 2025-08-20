// Searching
import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { rides } from "@/db/schema/tables.ts";
import { rideSearchSchema } from "@/validators/ride_validators.ts";
import { and, asc, between, desc, gt, sql } from "drizzle-orm";
import { HttpError } from "../../../utils/http_error.ts";

const router = express.Router();

const search_rides = async (req: Request, res: Response) => {
  const { search_start_location: start, search_end_location: end, by, from } =
    rideSearchSchema.parse(
      req.query,
    );

  // Time search

  const tolerance = 1000 * 60 * 60; //One Hour
  const time_check = from ?? by;

  if (!time_check) throw new HttpError(404, "Invalid Arguments Provided");
  const time = new Date(time_check).getTime();
  const condition = between(
    from ? rides.departureStartTime : rides.departureEndTime,
    new Date(time - tolerance),
    new Date(time + tolerance),
  );
  const order = asc(
    sql`abs(extract(epoch from (${
      from ? rides.departureStartTime : rides.departureEndTime
    } - ${time_check})))`,
  );

  // Location search

  const similarityStart = sql<
    number
  >`similarity(${rides.ride_start_location}, ${start})`;
  const similarityEnd = sql<
    number
  >`similarity(${rides.ride_end_location}, ${end})`;

  const found_rides = await db.select().from(rides).where(
    and(and(gt(similarityStart, 0), gt(similarityEnd, 0)), condition),
  ).orderBy(desc(sql`greatest(${similarityEnd}, ${similarityStart})`), order);

  res.json(found_rides);
};

router.get("/", asyncHandler(search_rides));

export default router;
