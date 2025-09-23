import express from "express";
import {
  deleteRide,
  dismiss,
  exit,
  manageRequest,
  members,
  request,
  rides,
  search,
  update,
} from "./rides/index.ts";
import {
  tokens,
  userBookmarks,
  userRequests,
  userRides,
  userRouter,
} from "./user/index.ts";
import { userRegisteredCheck } from "../middleware/user_registered.ts";

const router = express.Router();

router.use("/user", userRouter);
router.use("/user/requests", userRequests);
router.use("/user/rides", userRides);
router.use("/user/bookmarks", userRegisteredCheck, userBookmarks);
router.use("/user/tokens", tokens);

router.use("/rides", userRegisteredCheck, rides);
router.use("/rides/search", search);
router.use("/rides/request", userRegisteredCheck, request);
router.use("/rides/exit", userRegisteredCheck, exit);

router.use("/rides/members", members);

router.use("/rides/manage/requests", userRegisteredCheck, manageRequest);
router.use("/rides/manage/delete", userRegisteredCheck, deleteRide);
router.use("/rides/manage/dismiss", userRegisteredCheck, dismiss);
router.use("/rides/manage/update", userRegisteredCheck, update);

export default router;
