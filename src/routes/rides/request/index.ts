// Create or remove ride requests

import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { userRequests } from "@/db/schema/tables.ts";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { rideIDSchema } from "@/validators/ride_validators.ts";
import { getTokens } from "../../../utils/notifications.ts";
import { sendToMessageQueue } from "../../../bullmq/queue.ts";

const router = express.Router();

const request = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const { rideId } = rideIDSchema.parse(req.params);

  // Check if ride members can allow another member into the ride
  const ride = await db.query.rides.findFirst({
    where: (rides, { eq }) => eq(rides.id, rideId),
    with: { user: { columns: { name: true } } }, // for some reason createdBy is named as user in the references?
  });

  if (!ride) {
    throw new HttpError(StatusCodes.NOT_FOUND, "The given ride was not found!");
  }

  const members = await db.query.rideMembers.findMany({
    where: (members, { eq }) => eq(members.rideId, rideId),
  });

  // User is already in ride / they created the ride
  if (
    members.filter((member) => member.userEmail === email).length > 0 ||
    ride.createdBy === email
  ) {
    throw new HttpError(
      StatusCodes.CONFLICT,
      "The given user is already a member of the ride",
    );
  }

  // Should this be checked for a request?
  if (members.length >= (ride?.maxMemberCount ?? 0)) {
    throw new HttpError(
      StatusCodes.SERVICE_UNAVAILABLE,
      "The requested ride is already full! Try requesting later when space is available or try finding another similar ride.",
    );
  }

  // Check if request already exists
  const exists = await db.query.userRequests.findFirst({
    where: (requests, { eq, and }) =>
      and(eq(requests.rideId, rideId), eq(requests.userEmail, email)),
  });

  // Don't insert and end silently
  if (exists) {
    res.end();
    return;
  }

  await db.insert(userRequests).values({
    userEmail: email,
    rideId,
    status: "pending",
  });

  await sendToMessageQueue(
    `${ride.user.name} wants to join your ride!`,
    `The user ${ride.user.name} has requested to join your ride from ${ride.rideStartLocation} to ${ride.rideEndLocation} that departs at ${ride.departureEndTime.toLocaleDateString()}`,
    await getTokens(ride.createdBy),
  );

  res.end();
};

const deleteRequest = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const { rideId } = rideIDSchema.parse(req.params);

  const request = await db.query.userRequests.findFirst({
    where: (request, { eq, and }) =>
      and(eq(request.rideId, rideId), eq(request.userEmail, email)),
  });

  if (!request) {
    throw new HttpError(
      StatusCodes.NOT_FOUND,
      "The given request was not found!",
    );
  }

  // Don't remove requests that have had an action on them by the ride owner
  // This is so that it can appear on the inbox page of the user's requests
  if (request.status !== "pending") {
    // Locked or conflict?
    throw new HttpError(
      StatusCodes.LOCKED,
      "The given request cannot be deleted since it was resolved already!",
    );
  }

  // The user has to own the request if the above checks passed
  await db.delete(userRequests).where(
    and(
      eq(userRequests.rideId, rideId),
      eq(userRequests.userEmail, email),
    ),
  );

  res.end();
};

// Request to join a ride
router.post("/:rideId", asyncHandler(request));
router.delete("/:rideId", asyncHandler(deleteRequest));

export default router;
