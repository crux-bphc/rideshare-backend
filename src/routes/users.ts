import express from "express";
import { db } from "../db/client.ts";
import { users } from "../db/schema/tables.ts";

const router = express.Router();

router.get("/", async (_, res) => {
  // get user email
  const email = res.locals.user.email;

  // finding user;
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

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

router.post("/", async (req, res) => {
  if (!req.body) {
    res.status(400);
    return;
  }

  const name: string = req.body?.name ?? res.locals.user.name;
  const email: string = res.locals.user.email;
  const phoneNumber = req.body?.phone;

  if (!phoneNumber) {
    res.status(422).json({ message: "Phone number not provided." });
    return;
  }

  await db.insert(users).values({
    phoneNumber,
    email,
    name,
  });
});

export default router;
