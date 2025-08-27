import express from "express";
import {
  bookmark,
  deleteRide,
  dismiss,
  exit,
  manageRequest,
  request,
  rides,
  search,
  update,
} from "./rides/index.ts";
import { userRequests, userRouter } from "./user/index.ts";
import { userRegisteredCheck } from "../middleware/user_registered.ts";

const router = express.Router();

router.use("/user", userRouter);
router.use("/user/requests", userRequests);

router.use("/rides", userRegisteredCheck, rides);
router.use("/rides/search", userRegisteredCheck, search);
router.use("/rides/request", userRegisteredCheck, request);
router.use("/rides/exit", userRegisteredCheck, exit);

router.use("/rides/bookmarks", userRegisteredCheck, bookmark);

router.use("/rides/manage/requests", userRegisteredCheck, manageRequest);
router.use("/rides/manage/delete", userRegisteredCheck, deleteRide);
router.use("/rides/manage/dismiss", userRegisteredCheck, dismiss);
router.use("/rides/manage/update", userRegisteredCheck, update);

export default router;
