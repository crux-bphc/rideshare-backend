import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { StatusCodes } from "http-status-codes";
import { rideMembers, rides } from "@/db/schema/tables.ts";
import { and, asc, eq, lt, sql } from "drizzle-orm";

const router = express.Router();

const created = async (_req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const createdRides = await db.query.rides.findMany({
    where: (rides, { eq }) => eq(rides.createdBy, email),
  });

  if (!createdRides.length) {
    throw new HttpError(404, "User has not made any rides.");
  }

  res.json(createdRides);
};

const joined = async (_req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const joinedRides = await db.select({
    id: rides.id,
    createdBy: rides.createdBy,
    comments: rides.comments,
    departureStartTime: rides.departureStartTime,
    departureEndTime: rides.departureEndTime,
    maxMemberCount: rides.maxMemberCount,
    rideStartLocation: rides.rideStartLocation,
    rideEndLocation: rides.rideEndLocation,
  })
    .from(rideMembers)
    .where(eq(rideMembers.userEmail, email))
    .innerJoin(
      rides,
      eq(rides.id, rideMembers.rideId),
    );

  if (!joinedRides.length) {
    throw new HttpError(404, "User has not joined any rides.");
  }

  res.json(joinedRides);
};

const completed = async (_req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const order = asc(
    sql`abs(extract(epoch from (${
      (new Date(Date.now())).toISOString()
    } - ${rides.departureEndTime})))`,
  );

  const completedRides = await db.select({
    id: rides.id,
    createdBy: rides.createdBy,
    comments: rides.comments,
    departureStartTime: rides.departureStartTime,
    departureEndTime: rides.departureEndTime,
    maxMemberCount: rides.maxMemberCount,
    rideStartLocation: rides.rideStartLocation,
    rideEndLocation: rides.rideEndLocation,
  })
    .from(rideMembers)
    .where(eq(rideMembers.userEmail, email))
    .innerJoin(
      rides,
      and(
        eq(rides.id, rideMembers.rideId),
        lt(rides.departureEndTime, new Date(Date.now())),
      ),
    )
    .orderBy(order);

  if (!completedRides.length) {
    throw new HttpError(404, "User has not completed any rides.");
  }

  res.json(completedRides);
};

router.get("/created/", asyncHandler(created));
router.get("/joined/", asyncHandler(joined));
router.get("/completed/", asyncHandler(completed));

export default router;
