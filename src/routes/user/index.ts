import { z } from "zod";
import express, { Request, Response } from "express";
import { db } from "../../db/client.ts";
import { users } from "../../db/schema/tables.ts";
import { asyncHandler } from "../route_handler.ts";
import { HttpError } from "../../utils/http_error.ts";

const userSchema = z.object({
  name: z.string().optional().or(z.literal(undefined)),
  phone: z.string().length(10, "Phone number must be of length 10").regex(
    /^\d+$/,
  ),
});

const router = express.Router();

const get_user = async (_: Request, res: Response) => {
  // get user email
  const email = res.locals.user.email;

  // finding user;
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  //   const user = await db.query.users.findMany(); // (for testing)

  if (!user) {
    throw HttpError;
  }
};

router.get("/", asyncHandler(get_user));

const post_user = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) return;

  const userDetails = z.parse(userSchema, req.params);

  const name: string = userDetails?.name ?? res.locals.user.name;
  const phoneNumber: string = userDetails.phone;

  await db.insert(users).values({
    phoneNumber,
    email,
    name,
  });
};

router.post("/", asyncHandler(post_user));

export default router;
