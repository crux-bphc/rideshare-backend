import express from "express";
import { db } from "../db/client.ts";
import { users } from "../db/schema/tables.ts";

const router = express.Router();

router.get("/", async (_, res) => {
  const email = "example@gmail.com";
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
    res.json(user);
  }
});

router.post("/", async (req, res) => {
  console.log(req.body);
  const name: string = req.body?.name ?? res.locals.claims.name;
  //   const email: string = res.locals.claims.email;
  const email: string = req.body.email;
  const phoneNumber = req.body?.phone;

  if (!phoneNumber) {
    res.status(404).json({ message: "Phone number not provided" });
  }

  await db.insert(users).values({
    phoneNumber,
    email,
    name,
  });
});

router.get("/user", (req, res) => {
  res.json(res);
});

export default router;
