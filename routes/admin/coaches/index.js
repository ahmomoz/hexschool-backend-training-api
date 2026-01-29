const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Coach");
const { z } = require("zod");
const { dataSource } = require("@/db/data-source");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");
const { Conflict, NotFound } = require("@/errors");
const { validate } = require("@/middlewares/validate.middleware");

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

module.exports = router;
