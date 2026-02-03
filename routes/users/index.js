const express = require("express");
const router = express.Router();
const config = require("@/config/index");
const logger = require("@/utils/logger")("User");

const { dataSource } = require("@/db/data-source");
const { validate } = require("@/middlewares/validate.middleware");

const {
  baseUserSchema,
  loginUserSchema,
  putUserSchema,
} = require("@/validations/user.schema");

const userController = require("@/controllers/users");

const isAuth = require("@/middlewares/auth.middleware")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

// 使用者註冊
// POST /api/users/signup
router.post("/signup", validate(baseUserSchema), userController.signup);

// 使用者登入
// POST /api/users/login
router.post("/login", validate(loginUserSchema), userController.login);

// 取得個人資料
// GET /api/users/profile
router.get("/profile", isAuth, userController.getProfile);

// 編輯個人資料
// PUT /api/users/profile
router.put(
  "/profile",
  validate(putUserSchema),
  isAuth,
  userController.updateProfile,
);

module.exports = router;
