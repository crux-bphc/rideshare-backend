import express from "express";
import requestRouter from "./rides/request/index.ts";
import deleteRouter from "./rides/manage/delete/index.ts";
import requestManageRouter from "./rides/manage/requests/index.ts";
import searchRouter from "./rides/search/index.ts";
import ridesRouter from "./rides/rides.ts";

const router = express.Router();

router.use("/rides", ridesRouter);
router.use("/rides/search", searchRouter);
router.use("/rides/request", requestRouter);
router.use("/rides/manage/requests", requestManageRouter);
router.use("/rides/manage/delete", deleteRouter);

export default router;
