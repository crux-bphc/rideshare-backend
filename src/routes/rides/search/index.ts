// Searching
import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { rides } from "@/db/schema/tables.ts";
import {
  rideLocationSearchSchema,
  rideTimeSearchSchema,
} from "@/validators/ride_validators.ts";
import { asc, between, desc, gt, or, sql } from "drizzle-orm";
import { HttpError } from "../../../utils/http_error.ts";

const router = express.Router();

const search_location = async (req: Request, res: Response) => {
  const { search_location: search_query } = rideLocationSearchSchema.parse(
    req.query,
  );

  const similarityStart = sql<
    number
  >`similarity(${rides.ride_start_location}, ${search_query})`;
  const similarityEnd = sql<
    number
  >`similarity(${rides.ride_end_location}, ${search_query})`;

  const found_rides = await db.select().from(rides).where(
    or(gt(similarityStart, 0), gt(similarityEnd, 0)),
  ).orderBy(desc(sql`greatest(${similarityEnd}, ${similarityStart})`));

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
