import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { StatusCodes } from "http-status-codes";
import { rideMembers, rides, userBookmarks } from "@/db/schema/tables.ts";
import { and, asc, eq, lt, sql } from "drizzle-orm";
import { rideResponseObject } from "@/utils/response_schemas.ts";

const router = express.Router();

const created = async (_req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const createdRides = await db.select(rideResponseObject)
    .from(rides)
    .where(eq(rides.createdBy, email))
    .leftJoin(
      userBookmarks,
      and(
        eq(userBookmarks.rideId, rides.id),
        eq(userBookmarks.userEmail, email),
      ),
    );

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

  const joinedRides = await db.select(rideResponseObject)
    .from(rideMembers)
    .where(eq(rideMembers.userEmail, email))
    .innerJoin(
      rides,
      eq(rides.id, rideMembers.rideId),
    )
    .leftJoin(
      userBookmarks,
      and(
        eq(userBookmarks.rideId, rides.id),
        eq(userBookmarks.userEmail, email),
      ),
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
    sql`abs(extract(epoch from (NOW() - ${rides.departureEndTime})))`,
  );

  const completedRides = await db.select(rideResponseObject)
    .from(rideMembers)
    .where(eq(rideMembers.userEmail, email))
    .innerJoin(
      rides,
      and(
        eq(rides.id, rideMembers.rideId),
        lt(rides.departureEndTime, new Date()),
      ),
    )
    .leftJoin(
      userBookmarks,
      and(
        eq(userBookmarks.rideId, rides.id),
        eq(userBookmarks.userEmail, email),
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
