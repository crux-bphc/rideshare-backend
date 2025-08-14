import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";

const router = express.Router();

const requestSent = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) return;

  const user_reqs = await db.query.userRequests.findMany({
    where: (requests, { eq }) => eq(requests.userEmail, email),
  });

  if (!user_reqs) throw new HttpError(404, "No requests found");

  res.json(user_reqs);
};

const requestRecieved = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) return;

  const user_rides = await db.query.rides.findMany({
    where: (rides, { eq }) => eq(rides.createdBy, email),
  });

  if (!user_rides) throw new HttpError(404, "User has no rides to request.");

  var user_requests: {
    rideId: number;
    status: "accepted" | "declined" | "pending";
    userEmail: string;
  }[] = [];

  user_rides.map(async (ride) => {
    const ride_requests = await db.query.userRequests.findMany({
      where: (requests, { eq }) => eq(requests.rideId, ride.id),
    });

    if (!ride_requests) return;

    user_requests.push(...ride_requests);
  });

  if (!user_requests.length) throw new HttpError(404, "User has no requests");

  res.json(user_requests);
};

router.get("/sent", asyncHandler(requestSent));
router.get("/recieved", asyncHandler(requestRecieved));

export default router;
