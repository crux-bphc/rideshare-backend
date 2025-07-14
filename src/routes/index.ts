import express from "express";
import ridesRouter from "./rides.ts";
import userRouter from "./users.ts";

const router = express.Router();

router.use("/rides", ridesRouter);
router.use("/user", userRouter);

export default router;
