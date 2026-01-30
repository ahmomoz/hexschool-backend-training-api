const express = require("express");
const router = express.Router();

const creditPackageRouter = require("@/routes/creditPackage");
const coachRouter = require("@/routes/admin/coaches");
const skillRouter = require("@/routes/admin/coaches/skills");
const courseRouter = require("@/routes/admin/coaches/courses");
const userRouter = require("@/routes/users");

router.use("/credit-package", creditPackageRouter);

router.use("/admin/coaches/skill", skillRouter);
router.use("/admin/coaches/courses", courseRouter);
router.use("/admin/coaches", coachRouter);

router.use("/users", userRouter);

module.exports = router;
