const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Coach");
const { z } = require("zod");
const { dataSource } = require("@/db/data-source");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");
const { Conflict, NotFound } = require("@/errors");
const { validate, validateId } = require("@/middlewares/validate.middleware");

const createCoachSchema = z.object({
  experience_years: z.number().int("教練年資必須是整數"),
  description: z.string().min(1, "教練簡介為必填"),
  profile_image_url: z
    .string()
    .optional()
    .refine((val) => !val || /\.(jpg|jpeg|png)$/i.test(val), {
      message: "圖片格式必須為 .jpg 或 .png",
    }),
});

// 將使用者新增為教練
// POST /api/admin/coaches/:userId
router.post(
  "/:userId",
  validate(createCoachSchema),
  catchAsync(async (req, res, next) => {
    const userRepo = dataSource.getRepository("User");
    const coachRepo = dataSource.getRepository("Coach");

    const { userId } = req.params;

    const {
      experience_years: experienceYears,
      description,
      profile_image_url: profileImageUrl = null,
    } = req.body;

    const existingUser = await userRepo.findOne({
      select: ["id", "name", "role"],
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return next(NotFound("找不到使用者"));
    }

    if (existingUser.role === "COACH") {
      return next(Conflict("使用者已經是教練"));
    }

    const newCoach = coachRepo.create({
      user_id: userId,
      experience_years: experienceYears,
      description,
      profile_image_url: profileImageUrl,
    });

    await userRepo.update(
      {
        id: userId,
        role: "USER",
      },
      {
        role: "COACH",
      },
    );

    const savedCoach = await coachRepo.save(newCoach);
    const savedUser = await userRepo.findOne({
      select: ["name", "role"],
      where: { id: userId },
    });

    sendSuccess(res, {
      data: {
        user: savedUser,
        coach: savedCoach,
      },
      message: "新增成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
);

// 取得教練列表
// GET /api/coaches/?per=?page=?
router.get(
  "/",
  validate(
    z.object({
      per: z.coerce.number().int().min(1).default(10),
      page: z.coerce.number().int().min(1).default(1),
    }),
    "query",
  ),
  catchAsync(async (req, res) => {
    const coachRepo = dataSource.getRepository("Coach");
    const { per, page } = req.query;

    const [coaches] = await coachRepo.findAndCount({
      skip: (page - 1) * per,
      take: per,
      relations: {
        User: true,
      },
    });

    const coachList = coaches.map((coach) => ({
      id: coach.id,
      name: coach.User?.name,
    }));

    sendSuccess(res, { data: coachList, message: "查詢成功" });
  }),
);

// 取得教練詳細資訊
// GET /api/coaches/:coachId
router.get(
  "/:coachId",
  validateId("coachId"),
  catchAsync(async (req, res) => {
    const coachRepo = dataSource.getRepository("Coach");

    const { coachId } = req.params;

    const existingCoach = await coachRepo.findOne({
      where: {
        id: coachId,
      },
      select: {
        User: {
          name: true,
          role: true,
        },
      },
      relations: ["User"],
    });
    if (!existingCoach) {
      return next(NotFound("找不到該教練"));
    }

    const user = { ...existingCoach.User };
    const coach = { ...existingCoach, User: undefined };

    sendSuccess(res, {
      data: { user: user, coach: coach },
      message: "查詢成功",
    });
  }),
);

module.exports = router;
