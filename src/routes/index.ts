import express from "express";
import ridesRouter from "./rides.ts";

const router = express.Router();

router.use("/rides", ridesRouter);

export default router;
