const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("User");
const { z } = require("zod");
const { dataSource } = require("@/db/data-source");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");
const { Conflict } = require("@/errors");
const { validate } = require("@/middlewares/validate.middleware");

const userSchema = z.object({
  name: z
    .string()
    .min(2, "使用者名稱最少 2 個字")
    .max(10, "使用者名稱最多 10 個字")
    .regex(
      /^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
      "使用者名稱不可包含任何特殊符號與空白",
    ),
  email: z.string().email("請輸入正確的電子郵件格式"),
  password: z
    .string()
    .min(8, "密碼最短需 8 個字")
    .max(16, "密碼最長 16 個字")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密碼必須包含英文大小寫及數字"),
});

// 使用者註冊
// POST /api/users/signup
router.post(
  "/signup",
  validate(userSchema),
  catchAsync(async (req, res, next) => {
    const userRepo = dataSource.getRepository("User");
    const { name, email, password } = req.body;

    const existingUser = await userRepo.findOne({
      select: ["email"],
      where: {
        email,
      },
    });

    if (existingUser) {
      return next(Conflict("Email 已被使用"));
    }

    const newSave = userRepo.create({
      name: name,
      email: email,
      password: password,
      role: "USER",
    });
    const createdUser = await userRepo.save(newSave);

    sendSuccess(res, {
      data: createdUser,
      message: "註冊成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
);

module.exports = router;
