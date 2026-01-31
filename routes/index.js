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

const creditPackageRouter = require("@/routes/creditPackage");
const coachRouter = require("@/routes/admin/coaches");
const skillRouter = require("@/routes/admin/coaches/skills");
const courseRouter = require("@/routes/admin/coaches/courses");
const userRouter = require("@/routes/users");

// --- 公開路由 (不需要登入) ---
router.use("/credit-package", creditPackageRouter);

// --- 公開與私有行為混合 (驗證控制在其路由裡) ---
router.use("/users", userRouter);

// --- 受保護路由 (統一加上 isAuth) ---
// 下面這行會套用到所有「之後」定義在 /admin 路徑下的路由
router.use("/admin", isAuth);

router.use("/admin/coaches/skill", skillRouter);
router.use("/admin/coaches/courses", courseRouter);
router.use("/admin/coaches", coachRouter);

module.exports = router;
