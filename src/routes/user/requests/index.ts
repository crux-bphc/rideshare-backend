import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

const requestSent = async (_req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const userReqs = await db.query.userRequests.findMany({
    where: (requests, { eq }) => eq(requests.userEmail, email),
  });

  if (!userReqs.length) throw new HttpError(404, "No requests found");

  res.json(userReqs);
};

const requestReceived = async (_req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const userRides = await db.query.rides.findMany({
    where: (rides, { eq }) => eq(rides.createdBy, email),
  });

  if (!userRides.length) {
    throw new HttpError(404, "User has no rides to request.");
  }
  // Collect all ride requests for each ride
  const rideRequestsArrays = await Promise.all(
    userRides.map(async (ride) => {
      const rideRequests = await db.query.userRequests.findMany({
        where: (requests, { eq }) => eq(requests.rideId, ride.id),
      });
      return rideRequests || [];
    }),
  );
  // Flatten the array of arrays into a single array
  const userRequests = rideRequestsArrays.flat();

  if (!userRequests.length) throw new HttpError(404, "User has no requests");

  res.json(userRequests);
};

router.get("/sent", asyncHandler(requestSent));
router.get("/received", asyncHandler(requestReceived));

export default router;
