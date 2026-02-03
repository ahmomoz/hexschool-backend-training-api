const courseController = require("@/controllers/courses.controller");

const express = require("express");
const router = express.Router();
const config = require("@/config/index");
const logger = require("@/utils/logger")("Course");

const { z } = require("zod");
const { dataSource } = require("@/db/data-source");
const { validate, validateId } = require("@/middlewares/validate.middleware");

const isAuth = require("@/middlewares/auth.middleware")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

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
  validateId("courseId"),
  isAuth,
  courseController.createCourse,
);

// 取消課程
// DELETE /api/courses/:courseId
router.delete(
  "/:courseId",
  validateId("courseId"),
  isAuth,
  courseController.deleteCourse,
);

module.exports = router;
