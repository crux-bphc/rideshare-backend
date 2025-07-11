import express from "express";
import { db } from "../db/client.ts";

const router = express.Router();

router.get("/", async (_, res) => {
  const rides = await db.query.rides.findMany({
    with: {
      stops: {
        orderBy: (stops, { asc }) => asc(stops.order),
      },
      rideMembers: true,
      user: true,
    },
  });
  res.json(rides);
});

export default router;
