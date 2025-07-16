import express, { Request, Response } from "express";
import { db } from "../../db/client.ts";
import { users } from "../../db/schema/tables.ts";
import { userSchema } from "./index.ts";
import { z } from "zod";
import { asyncHandler } from "../route_handler.ts";

const router = express.Router();

router.get("/", async (_, res) => {
  // get user email
  const email = res.locals.user.email;

  // finding user;
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  // const user = await db.query.users.findMany(); // (for testing)

  if (!user) {
    res
      .status(404)
      .json({
        message: "User not found",
      });
  } else {
    res.status(200).json(user);
  }
});

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

  console.log("Inserted user: ", name);
};

router.post("/", asyncHandler(post_user));

export default router;
