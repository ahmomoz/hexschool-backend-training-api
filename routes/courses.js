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
const { validate } = require("@/middlewares/validate.middleware");

// 取得課程列表
// GET /api/courses/?per=?page=?
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
    const courseRepo = dataSource.getRepository("Course");
    const { per, page } = req.query;

    const [courses] = await courseRepo.findAndCount({
      skip: (page - 1) * per,
      take: per,
      relations: {
        User: true,
        Skill: true,
      },
    });

    const courseList = courses.map((course) => ({
      id: course.id,
      coach_name: course.User?.name,
      skill_name: course.Skill?.name,
      name: course.name,
      description: course.description,
      start_at: course.start_at,
      end_at: course.end_at,
      max_participants: course.max_participants,
    }));

    sendSuccess(res, { data: courseList, message: "查詢成功" });
  }),
);

module.exports = router;
