// Searching
import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { getItems } from "@/utils/db_search.ts";
import { rideMembers, rides, stops } from "@/db/schema/tables.ts";
import { rideSearchSchema } from "@/validators/ride_validators.ts";

const router = express.Router();

const search = async (req: Request, res: Response) => {
  const { search_query } = rideSearchSchema.parse(req.query);

  // const rides = await db.query.rides.findMany({
  //   with: {
  //     stops: {
  //       orderBy: (stops, { asc }) => asc(stops.order),
  //     },
  //     rideMembers: true,
  //     user: true,
  //   },
  // });
  const rides = await getItems(
    stops,
    stops.location,
    search_query,
    stops.rideId,
    stops.order,
  );
  res.json(rides);
};

router.get("/", asyncHandler(search));

export default router;
