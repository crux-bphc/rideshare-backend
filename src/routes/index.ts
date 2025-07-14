import express from "express";
import requestRouter from "./rides/request/index.ts";
import manageRouter from "./rides/manage/index.ts";
import searchRouter from "./rides/search/index.ts";
import ridesRouter from "./rides/ride.ts";

const router = express.Router();

router.use("/rides", ridesRouter);
router.use("/rides/search", searchRouter);
router.use("/rides/request", requestRouter);
router.use("/rides/manage", manageRouter);

export default router;
