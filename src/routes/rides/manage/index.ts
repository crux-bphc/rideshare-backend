// Accept or reject ride requests

import express, { Request, Response } from "express";
import { db } from "../../../db/client.ts";
import { rideMembers, userRequests } from "../../../db/schema/tables.ts";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { rideIDSchema } from "../index.ts";
import { asyncHandler } from "../../route_handler.ts";
import { HttpError } from "../../../utils/http_error.ts";

const router = express.Router();

const manageSchema = z.object({
  requestUserEmail: z.string(),
  status: z.enum(["accepted", "declined"]),
});

const manage = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) return;

  const { rideId } = z.parse(rideIDSchema, req.params);
  const { requestUserEmail, status } = z.parse(manageSchema, req.body);

  const ride = await db.query.rides.findFirst({
    where: (rides, { eq }) => eq(rides.id, rideId),
  });

  // Check if the ride actually belongs to the user
  if ((ride?.createdBy ?? -1) !== email) {
    throw new HttpError(
      StatusCodes.UNAUTHORIZED,
      "The current user cannot change the given ride data! User is not the owner of the ride.",
    );
  }

  // Check if the given user id is in the ride requests
  const requestUser = await db.query.userRequests.findFirst({
    where: (user, { eq, and }) => and(eq(user.userEmail, requestUserEmail), eq(user.rideId, rideId)),
  });

  if (!requestUser) {
    throw new HttpError(
      StatusCodes.NOT_FOUND,
      "User that requested to join the ride was not found!",
    );
  }

  const members = await db.query.rideMembers.findMany({
    where: (members, { eq }) => eq(members.rideId, rideId),
  });

  // Check if ride members can allow another member into the ride
  if (members.length >= (ride?.maxMemberCount ?? 0)) {
    throw new HttpError(
      StatusCodes.SERVICE_UNAVAILABLE,
      "This ride is already full! This request cannot be accepted unless you change the max member count or remove someone from your ride.",
    );
  }

  // Check if member already exists
  if (
    members.filter((member) => member.userEmail == requestUserEmail)
      .length >
      0
  ) {
    throw new HttpError(
      StatusCodes.CONFLICT,
      "This ride member already exists for the given ride!",
    );
  }

  await db.transaction(async (tx) => {
    // Update request
    await tx.update(userRequests).set({ status }).where(
      and(
        eq(userRequests.userEmail, requestUserEmail),
        eq(userRequests.rideId, rideId),
      ),
    );

    if (status === "accepted") {
      // Add member
      await tx.insert(rideMembers).values({
        userEmail: requestUserEmail,
        rideId,
      });
    }
  });

  // Notify requested user about their ride status here

  res.end();
};

router.post(
  "/:rideId",
  asyncHandler(manage),
);

export default router;
