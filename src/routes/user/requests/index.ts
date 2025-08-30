import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { StatusCodes } from "http-status-codes";
import { rides, userRequests } from "@/db/schema/tables.ts";
import { and, eq } from "drizzle-orm";
import { rideResponseObject } from "@/utils/response_schemas.ts";
const router = express.Router();

const requestSent = async (_req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const requestedRides = await db.select({
    status: userRequests.status,
    ...rideResponseObject,
  }).from(userRequests)
    .where(eq(userRequests.userEmail, email))
    .innerJoin(rides, eq(rides.id, userRequests.rideId));

  if (!requestedRides.length) throw new HttpError(404, "No requests found");

  res.json(requestedRides);
};

const requestReceived = async (_req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const requestedRides = await db.select({
    requestSender: userRequests.userEmail,
    status: userRequests.status,
    ...rideResponseObject,
  }).from(userRequests)
    .innerJoin(
      rides,
      and(eq(rides.id, userRequests.rideId), eq(rides.createdBy, email)),
    );

  if (!requestedRides.length) {
    throw new HttpError(404, "User has no requests.");
  }

  res.json(requestedRides);
};

router.get("/sent", asyncHandler(requestSent));
router.get("/received", asyncHandler(requestReceived));

export default router;
