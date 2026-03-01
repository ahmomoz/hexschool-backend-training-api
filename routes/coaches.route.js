const coachController = require("@/controllers/coaches.controller");

const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Course");

const { z } = require("zod");
const { validate } = require("@/middlewares/validate.middleware");

const { coachIdSchema } = require("@/validations/coach.schema");

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
  coachController.getCoaches,
);

// 取得教練詳細資訊
// GET /api/coaches/:coachId
router.get(
  "/:coachId",
  validate(coachIdSchema, "params"),
  coachController.getCoach,
);

// 取得指定教練課程列表
// GET /api/coaches/:coachId/courses
router.get(
  "/:coachId/courses",
  validate(coachIdSchema, "params"),
  coachController.getCoachCourses,
);

module.exports = router;
