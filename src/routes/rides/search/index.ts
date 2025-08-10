// Searching
import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { rides, stops } from "@/db/schema/tables.ts";
import {
  rideLocationSearchSchema,
  rideTimeSearchSchema,
} from "@/validators/ride_validators.ts";
import { and, asc, between, desc, eq, gt, sql } from "drizzle-orm";
import { HttpError } from "../../../utils/http_error.ts";

const router = express.Router();

const search_location = async (req: Request, res: Response) => {
  const { search_query } = rideLocationSearchSchema.parse(req.query);

  const similarity = sql<
    number
  >`similarity(${stops.location}, ${search_query})`;

  const found_rides = await db.select({
    ride: rides.id,
    time: rides.departureStartTime,
    description: rides.comments,
    location: stops.location,
  }).from(stops).leftJoin(rides, eq(rides.id, stops.rideId)).where(
    gt(similarity, 0),
  ).orderBy(desc(similarity)).limit(4);

  res.json(found_rides);
};

const search_time = async (req: Request, res: Response) => {
  const constraints = rideTimeSearchSchema.parse(req.query);

  let condition, order;

  if (constraints.from) {
    const time = new Date(constraints.from).getTime();
    const tolerance = 1000 * 60 * 60; //One Hour
    condition = between(
      rides.departureStartTime,
      new Date(time - tolerance),
      new Date(time + tolerance),
    );
    order = asc(
      sql`abs(extract(epoch from (${rides.departureStartTime} - ${constraints.from})))`,
    );
  } else if (constraints.by) {
    const time = new Date(constraints.by).getTime();
    const tolerance = 1000 * 60 * 60; //One Hour
    condition = between(
      rides.departureEndTime,
      new Date(time - tolerance),
      new Date(time + tolerance),
    );
    order = asc(
      sql`abs(extract(epoch from (${rides.departureEndTime} - ${constraints.by})))`,
    );
  } else {
    throw new HttpError(404, "Invalid Arguments Provided");
  }

  const found_rides = await db.select().from(rides).where(condition).orderBy(
    order,
  );

  res.json(found_rides);
};

router.get("/location/", asyncHandler(search_location));
router.get("/time/", asyncHandler(search_time));

export default router;
