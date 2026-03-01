const userController = require("@/controllers/users");

const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("User");

const { dataSource } = require("@/db/data-source");
const { validate } = require("@/middlewares/validate.middleware");

const config = require("@/config/index");
const isAuth = require("@/middlewares/auth.middleware")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

const {
  baseUserSchema,
  loginUserSchema,
  updateUserPasswordSchema,
  updateUserProfileSchema,
} = require("@/validations/user.schema");

// 使用者註冊
// POST /api/users/signup
router.post("/signup", validate(baseUserSchema), userController.signup);

// 使用者登入
// POST /api/users/login
router.post("/login", validate(loginUserSchema), userController.login);

// 使用者更新密碼
// PUT /api/users/password
router.put(
  "/password",
  isAuth,
  validate(updateUserPasswordSchema),
  userController.updatePassword,
);

// 取得個人資料
// GET /api/users/profile
router.get("/profile", isAuth, userController.getProfile);

// 編輯個人資料
// PUT /api/users/profile
router.put(
  "/profile",
  validate(updateUserProfileSchema),
  isAuth,
  userController.updateProfile,
);

// 取得使用者已購買的方案列表
// GET /api/users/credit-package
router.get("/credit-package", isAuth, userController.getCreditPackage);

// 取得已預約的課程列表
// GET /api/users/courses
router.get("/courses", isAuth, userController.getCourse);

module.exports = router;
