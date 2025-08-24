import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

const requestSent = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const user_reqs = await db.query.userRequests.findMany({
    where: (requests, { eq }) => eq(requests.userEmail, email),
  });

  if (!user_reqs.length) throw new HttpError(404, "No requests found");

  res.json(user_reqs);
};

const requestReceived = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const user_rides = await db.query.rides.findMany({
    where: (rides, { eq }) => eq(rides.createdBy, email),
  });

  if (!user_rides.length) {
    throw new HttpError(404, "User has no rides to request.");
  }

  // Collect all ride requests for each ride
  const rideRequestsArrays = await Promise.all(
    user_rides.map(async (ride) => {
      const ride_requests = await db.query.userRequests.findMany({
        where: (requests, { eq }) => eq(requests.rideId, ride.id),
      });
      return ride_requests || [];
    }),
  );
  // Flatten the array of arrays into a single array
  const user_requests = rideRequestsArrays.flat();

  if (!user_requests.length) throw new HttpError(404, "User has no requests");

  res.json(user_requests);
};

router.get("/sent", asyncHandler(requestSent));
router.get("/received", asyncHandler(requestReceived));

export default router;
