import express from "express";
<<<<<<< HEAD
import ridesRouter from "./rides.ts";
import userRouter from "./users.ts";
=======
import requestRouter from "./rides/request/index.ts";
import manageRouter from "./rides/manage/index.ts";
import searchRouter from "./rides/search/index.ts";
import ridesRouter from "./rides/rides.ts";
>>>>>>> c7e745740505b9f4e076435ca94662bd79d1c429

const router = express.Router();

router.use("/rides", ridesRouter);
<<<<<<< HEAD
router.use("/user", userRouter);
=======
router.use("/rides/search", searchRouter);
router.use("/rides/request", requestRouter);
router.use("/rides/manage", manageRouter);
>>>>>>> c7e745740505b9f4e076435ca94662bd79d1c429

export default router;
