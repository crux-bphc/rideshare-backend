import { RequestHandler } from "express";
import { db } from "@/db/client.ts";

export const userRegisteredCheck: RequestHandler = async (req, res, next) => {
  if (res.locals.user.email) {
    const found_user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, res.locals.user.email),
    });
    if (!found_user) {
      res.status(404).json({
        message: "Could not find user registered to this email.",
      });
      return;
    } else {
      next();
    }
  } else {
    res.status(404).json({ message: "Locals did not contain user email." });
  }
};
