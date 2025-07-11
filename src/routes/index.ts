import express from "express";
import ridesRouter from "./rides.ts";
import userRouter from "./users.ts";

const router = express.Router();

router.use("/rides", ridesRouter);
router.use("/users", userRouter);

export default router;
