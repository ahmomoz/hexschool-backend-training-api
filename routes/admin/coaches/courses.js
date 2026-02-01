const express = require("express");
const router = express.Router();
const isCoach = require("@/middlewares/isCoach.middleware");
const logger = require("@/utils/logger")("Skill");
const { z } = require("zod");
const { dataSource } = require("@/db/data-source");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");
const { NotFound } = require("@/errors");
const { validate, validateId } = require("@/middlewares/validate.middleware");

const baseCourseSchema = z.object({
  user_id: z.string().uuid("無效的使用者 ID 格式"),
  skill_id: z.string().uuid("無效的技能 ID 格式"),
  name: z.string().min(1, "課程名稱為必填"),
  description: z.string().min(1, "課程介紹為必填"),
  start_at: z.string().min(1, "課程開始時間為必填"),
  end_at: z.string().min(1, "課程結束時間為必填"),
  max_participants: z.number().min(1, "最大上課人數為必填"),
  meeting_url: z.string().url("線上直播網址格式需為網址").optional(),
});
const createCourseSchema = baseCourseSchema;
const putCourseSchema = baseCourseSchema
  .omit({
    user_id: true,
  })
  .extend({
    meeting_url: z
      .string()
      .min(1, "線上直播網址為必填")
      .url("線上直播網址格式需為網址"),
  });

// 新增教練課程資料
// POST /api/admin/coaches/courses
router.post(
  "/",
  validate(createCourseSchema),
  isCoach,
  catchAsync(async (req, res, next) => {
    const userRepo = dataSource.getRepository("User");
    const skillRepo = dataSource.getRepository("Skill");
    const courseRepo = dataSource.getRepository("Course");
    const {
      user_id,
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;

    const existingUser = await userRepo.findOne({
      select: ["id", "role"],
      where: {
        id: user_id,
      },
    });
    const existingSkill = await skillRepo.findOneBy({ id: skill_id });

    if (!existingUser) {
      return next(NotFound("使用者不存在"));
    }
    if (!existingSkill) {
      return next(NotFound("課程所需的技能不存在"));
    }

    const newCourse = courseRepo.create({
      user_id,
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    });
    const createdCourse = await courseRepo.save(newCourse);

    const courseData = await courseRepo.findOneBy({ id: createdCourse.id });

    sendSuccess(res, {
      data: courseData,
      message: "新增成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
);

// 編輯教練課程資料
// PUT /api/admin/coaches/courses/:courseId
router.put(
  "/:courseId",
  validateId("courseId"),
  validate(putCourseSchema),
  isCoach,
  catchAsync(async (req, res, next) => {
    const skillRepo = dataSource.getRepository("Skill");
    const courseRepo = dataSource.getRepository("Course");

    const { courseId } = req.params;
    const existingCourse = await courseRepo.findOneBy({ id: courseId });
    if (!existingCourse) {
      return next(NotFound("課程不存在"));
    }

    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;

    const existingSkill = await skillRepo.findOneBy({ id: skill_id });

    if (!existingSkill) {
      return next(NotFound("課程所需的技能不存在"));
    }

    await courseRepo.update(
      { id: courseId },
      {
        skill_id,
        name,
        description,
        start_at,
        end_at,
        max_participants,
        meeting_url,
      },
    );

    const updateCourse = await courseRepo.findOneBy({ id: courseId });

    sendSuccess(res, {
      data: updateCourse,
      message: "更新成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
);

module.exports = router;
