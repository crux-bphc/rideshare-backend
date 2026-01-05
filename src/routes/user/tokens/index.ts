import express, { Request, Response } from "express";
import { db } from "@/db/client.ts";
import { asyncHandler } from "@/routes/route_handler.ts";
import { HttpError } from "@/utils/http_error.ts";
import { StatusCodes } from "http-status-codes";
import { users } from "../../../db/schema/tables.ts";
import { and, eq, not, sql } from "drizzle-orm";
import z from "zod";

const router = express.Router();

const registerFCMToken = async (req: Request, res: Response) => {
  const { email } = res.locals.user;
  if (!email) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Email was not provided.");
  }

  const { token } = z.object({ token: z.string() }).parse(req.body);

  // In script this is less efficient?
  // Not using group messaging since it seems tedious, and apparently has a 20 device limit
  await db.update(users).set({
    tokens: sql`array_append(${users.tokens}, ${token})`,
  })
    .where(
      and(
        eq(users.email, email),
        not(sql`${token} = ANY(${users.tokens})`),
      ),
    );

  res.end();
};

router.post("/", asyncHandler(registerFCMToken));

export default router;
