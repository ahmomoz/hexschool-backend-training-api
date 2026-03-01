const coachController = require("@/controllers/coaches.controller");

const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Course");

const { validate } = require("@/middlewares/validate.middleware");

const { coachIdSchema } = require("@/validations/coach.schema");

// 取得指定教練課程列表
// GET /api/coaches/:coachId/courses
router.get(
  "/:coachId/courses",
  validate(coachIdSchema, "params"),
  coachController.getCoachCourses,
);

module.exports = router;
