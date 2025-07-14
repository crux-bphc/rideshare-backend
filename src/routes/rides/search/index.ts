// Searching
import express, { Request, Response } from "express";
import { db } from "../../../db/client.ts";
import { asyncHandler } from "../../route_handler.ts";

const router = express.Router();

const search = async (_: Request, res: Response) => {
  const rides = await db.query.rides.findMany({
    with: {
      stops: {
        orderBy: (stops, { asc }) => asc(stops.order),
      },
      rideMembers: true,
      user: true,
    },
  });
  res.json({ rides });
};

router.get("/", asyncHandler(search));

export default router;
