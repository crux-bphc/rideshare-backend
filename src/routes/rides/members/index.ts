import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { StatusCodes } from "http-status-codes";
import { rideIDSchema } from "../../../validators/ride_validators.ts";
import { rideMembers, users } from "@/db/schema/tables.ts";
import { eq } from "drizzle-orm";

const router = express.Router();

const getRideMembers = async (req: Request, res: Response) => {
  const { rideId } = rideIDSchema.parse(req.params);

  const members = await db.select({
    phoneNumber: users.phoneNumber,
    email: users.email,
    name: users.name,
  })
    .from(rideMembers)
    .where(eq(rideMembers.rideId, rideId))
    .innerJoin(users, eq(rideMembers.userEmail, users.email));

  if (!members.length) {
    throw new HttpError(StatusCodes.NOT_FOUND, "No ride found");
  }

  res.status(200).json(members);
};
router.get("/:rideId", asyncHandler(getRideMembers));

export default router;
