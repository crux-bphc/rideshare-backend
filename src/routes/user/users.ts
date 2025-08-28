import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { users } from "@/db/schema/tables.ts";
import { asyncHandler } from "../route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { userEmailSchema, userSchema } from "@/validators/user_validator.ts";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

const getUser = async (_: Request, res: Response) => {
  // get user email
  const email = res.locals.user.email;

  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  // finding user;
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (!user) {
    throw new HttpError(404, "User Not Found");
  }

  res.json(user);
};

const getUserByEmail = async (req: Request, res: Response) => {
  // get user email
  const { email } = userEmailSchema.parse(req.query);

  // finding user;
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (!user) {
    throw new HttpError(404, "User Not Found");
  }

  res.json(user);
};

const postUser = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const userDetails = userSchema.parse(req.body);

  const name: string = userDetails?.name ?? res.locals.user.name;
  const phoneNumber: string = userDetails.phoneNumber;

  await db.insert(users).values({
    phoneNumber,
    email,
    name,
  });

  res.status(201).json({ message: "User created successfully" });
};

router.get("/", asyncHandler(getUser));
router.get("/email/", asyncHandler(getUserByEmail));
router.post("/", asyncHandler(postUser));

export default router;
