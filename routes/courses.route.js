const courseController = require("@/controllers/courses.controller");

const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Course");

const { z } = require("zod");
const { dataSource } = require("@/db/data-source");
const { validate } = require("@/middlewares/validate.middleware");

const config = require("@/config/index");
const isAuth = require("@/middlewares/auth.middleware")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

const { courseIdSchema } = require("@/validations/course.schema");

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
  courseController.getCourses,
);

// 報名課程
// POST /api/courses/:courseId
router.post(
  "/:courseId",
  validate(courseIdSchema, "params"),
  isAuth,
  courseController.createCourse,
);

// 取消課程
// DELETE /api/courses/:courseId
router.delete(
  "/:courseId",
  validate(courseIdSchema, "params"),
  isAuth,
  courseController.deleteCourse,
);

module.exports = router;
