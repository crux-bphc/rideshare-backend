import express from "express";
import {
  deleteRide,
  dismiss,
  exit,
  manageRequest,
  request,
  rides,
  search,
  update,
} from "./rides/exports.ts";
import userRouter from "./user/index.ts";

const router = express.Router();

router.use("/user", userRouter);

router.use("/rides", rides);
router.use("/rides/search", search);
router.use("/rides/request", request);
router.use("/rides/exit", exit);

router.use("/rides/manage/requests", manageRequest);
router.use("/rides/manage/delete", deleteRide);
router.use("/rides/manage/dismiss", dismiss);
router.use("/rides/manage/update", update);

export default router;
