const express = require("express");
const router = express.Router();
const config = require("@/config/index");
const logger = require("@/utils/logger")("Admin");

const { dataSource } = require("@/db/data-source");

const isAuth = require("@/middlewares/auth.middleware")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

const creditPackageRouter = require("@/routes/creditPackage.route");
const userRouter = require("@/routes/users");
const courseRouter = require("@/routes/courses.route");
const adminSkillRouter = require("@/routes/admin/coaches/skill.route");
const adminCourseRouter = require("@/routes/admin/coaches/courses.route");
const adminCoachRouter = require("@/routes/admin/coaches");
const uploadRouter = require("@/routes/upload.route");

// --- 公開路由 (不需要登入) ---
router.use("/credit-package", creditPackageRouter);
router.use("/courses", courseRouter);

// --- 公開與私有行為混合 (驗證控制在其路由裡) ---
router.use("/users", userRouter);

// --- 受保護路由 (統一加上 isAuth) ---
// 下面這行會套用到所有「之後」定義在 /admin 路徑下的路由
router.use("/admin", isAuth);

router.use("/admin/coaches/skill", adminSkillRouter);
router.use("/admin/coaches/courses", adminCourseRouter);
router.use("/admin/coaches", adminCoachRouter);

router.use("/upload", uploadRouter);

module.exports = router;
