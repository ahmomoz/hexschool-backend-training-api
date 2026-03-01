const adminCourseController = require("@/controllers/admin/coaches/course.controller");

const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Course");

const { validate } = require("@/middlewares/validate.middleware");

const isCoach = require("@/middlewares/isCoach.middleware");

const {
  createCourseSchema,
  putCourseSchema,
  courseIdSchema,
} = require("@/validations/course.schema");

// 取得教練自己的課程列表
// GET /api/admin/coaches/courses
router.get(
  "/",
  isCoach,
  adminCourseController.getCourses,
);

// 新增教練課程資料
// POST /api/admin/coaches/courses
router.post(
  "/",
  validate(createCourseSchema),
  isCoach,
  adminCourseController.createCourse,
);

// 編輯教練課程資料
// PUT /api/admin/coaches/courses/:courseId
router.put(
  "/:courseId",
  validate(courseIdSchema, "params"),
  validate(putCourseSchema),
  isCoach,
  adminCourseController.updateCourse,
);

module.exports = router;
