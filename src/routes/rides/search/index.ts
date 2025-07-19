// Searching
import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { getItems } from "@/utils/db_search.ts";
import { rides, stops } from "@/db/schema/tables.ts";
import { rideSearchSchema } from "@/validators/ride_validators.ts";
import { eq } from "drizzle-orm";

const router = express.Router();

const search = async (req: Request, res: Response) => {
  const { search_query } = rideSearchSchema.parse(req.query);

  const found_rides = await getItems(
    stops,
    stops.location,
    search_query,
    [stops.location, rides.id],
    {
      joinTable: rides,
      on: eq(stops.rideId, rides.id),
      selectFromJoinTable: true,
    },
  );
  res.json(found_rides);
};

router.get("/", asyncHandler(search));

export default router;
