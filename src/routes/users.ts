import express from "express";
import { db } from "../db/client.ts";
import { users } from "../db/schema/tables.ts";

import { validateRequest } from "../middleware/zod_validation.ts";
import { z } from "zod";

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

const userSchema = z.looseObject({
  name: z.string().optional().or(z.literal(undefined)),
  phone: z.number().gt(Math.pow(10, 9) - 1).lt(Math.pow(10, 10)),
});

router.post("/", validateRequest(userSchema), async (req, res) => {
  console.log("Request: ", req.body);

  const name: string = req.body?.name ?? res.locals.user.name;
  const email: string = res.locals.user.email;
  // const email: string = req.body.email; //(for testing)
  const phoneNumber = req.body.phone;

  await db.insert(users).values({
    phoneNumber,
    email,
    name,
  });
});

export default router;
