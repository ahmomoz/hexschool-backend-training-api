const express = require("express");
const router = express.Router();
const isCoach = require("@/middlewares/isCoach.middleware");
const logger = require("@/utils/logger")("Skill");

const { validate } = require("@/middlewares/validate.middleware");

const {
  createCourseSchema,
  putCourseSchema,
  courseIdSchema,
} = require("@/validations/course.schema");

const courseController = require("@/controllers/admin/coaches/course.controller");

// 新增教練課程資料
// POST /api/admin/coaches/courses
router.post(
  "/",
  validate(createCourseSchema),
  isCoach,
  courseController.createCourse,
);

// 編輯教練課程資料
// PUT /api/admin/coaches/courses/:courseId
router.put(
  "/:courseId",
  validate(courseIdSchema, "params"),
  validate(putCourseSchema),
  isCoach,
  courseController.updateCourse,
);

module.exports = router;
