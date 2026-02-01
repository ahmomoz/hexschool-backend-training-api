const express = require("express");
const router = express.Router();
const config = require("@/config/index");
const logger = require("@/utils/logger")("User");
const generateJWT = require("@/utils/generateJWT");
const { z } = require("zod");
const { dataSource } = require("@/db/data-source");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");
const { Conflict, BadRequest } = require("@/errors");
const { validate } = require("@/middlewares/validate.middleware");
const { hashPassword, comparePassword } = require("@/utils/password");

const isAuth = require("@/middlewares/auth.middleware")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

const baseUserSchema = z.object({
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
const loginUserSchema = baseUserSchema.omit({
  name: true,
});
const putUserSchema = baseUserSchema.pick({
  name: true,
});

// 使用者註冊
// POST /api/users/signup
router.post(
  "/signup",
  validate(baseUserSchema),
  catchAsync(async (req, res, next) => {
    const userRepo = dataSource.getRepository("User");
    const { name, email, password } = req.body;

    // 檢查 Email 是否衝突
    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) {
      return next(Conflict("Email 已被使用"));
    }

    // 雜湊密碼
    const hashedPassword = await hashPassword(password);

    // 建立並存入資料庫
    const newSave = userRepo.create({
      name: name,
      email: email,
      password: hashedPassword,
      role: "USER",
    });
    const createdUser = await userRepo.save(newSave);

    const userResponse = {
      id: createdUser.id,
      name: createdUser.name,
    };

    sendSuccess(res, {
      data: userResponse,
      message: "註冊成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
);

// 使用者登入
// POST /api/users/login
router.post(
  "/login",
  validate(loginUserSchema),
  catchAsync(async (req, res, next) => {
    const userRepo = dataSource.getRepository("User");
    const { email, password } = req.body;

    // 檢查 Email 是否存在
    const existingUser = await userRepo.findOneBy({ email });
    // 檢查密碼是否比對成功
    const isPasswordMatch = await comparePassword(
      password,
      existingUser.password,
    );
    if (!existingUser || !isPasswordMatch) {
      return next(BadRequest("使用者不存在或密碼輸入錯誤"));
    }

    // 產生 JWT Token
    const token = await generateJWT(
      {
        id: existingUser.id,
      },
      config.get("secret.jwtSecret"),
      {
        expiresIn: `${config.get("secret.jwtExpiresDay")}`,
      },
    );

    sendSuccess(res, {
      data: {
        token,
        user: {
          name: existingUser.name,
        },
      },
      message: "登入成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
);

// 取得個人資料
// GET /api/users/profile
router.get(
  "/profile",
  isAuth,
  catchAsync(async (req, res, next) => {
    const userRepo = dataSource.getRepository("User");
    const { id } = req.user;

    const responseUser = await userRepo.findOne({
      select: ["name", "email"],
      where: {
        id,
      },
    });

    sendSuccess(res, {
      data: responseUser,
      message: "查詢成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
);

// 編輯個人資料
// PUT /api/users/profile
router.put(
  "/profile",
  validate(putUserSchema),
  isAuth,
  catchAsync(async (req, res, next) => {
    const userRepo = dataSource.getRepository("User");
    const { id } = req.user;
    const { name } = req.body;

    await userRepo.update({ id }, { name });

    sendSuccess(res, {
      message: "更新成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
);

module.exports = router;
