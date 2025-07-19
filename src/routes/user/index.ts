import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { users } from "@/db/schema/tables.ts";
import { asyncHandler } from "../route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { userSchema } from "@/validators/user_validator.ts";

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
    throw new HttpError(404, "User Not Found");
  }

  res.json(user);
};

router.get("/", asyncHandler(get_user));

const post_user = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) return;

  const userDetails = userSchema.parse(req.body);

  const name: string = userDetails?.name ?? res.locals.user.name;
  const phoneNumber: string = userDetails.phone;

  await db.insert(users).values({
    phoneNumber,
    email,
    name,
  });

  res.json(201).json({ message: "User created successfully" });
};

router.post("/", asyncHandler(post_user));

export default router;
