const express = require("express");
const router = express.Router();
const config = require("@/config/index");
const logger = require("@/utils/logger")("Skill");
const { z } = require("zod");
const { IsNull } = require("typeorm");
const { dataSource } = require("@/db/data-source");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");
const { BadRequest } = require("@/errors");
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

// 報名課程
// POST /api/courses/:courseId
router.post(
  "/:courseId",
  validateId("courseId"),
  isAuth,
  catchAsync(async (req, res, next) => {
    const courseRepo = dataSource.getRepository("Course");
    const courseBookingRepo = dataSource.getRepository("CourseBooking");
    const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");

    const { id } = req.user;
    const { courseId } = req.params;

    // 找不到課程
    const course = await courseRepo.findOneBy({ id: courseId });
    if (!course) {
      return next(BadRequest("找不到此課程"));
    }

    // 已報名過此課程
    const isBooking = await courseBookingRepo.findOneBy({
      user_id: id,
      course_id: courseId,
    });
    if (isBooking) {
      return next(BadRequest("已經報名過此課程"));
    }

    // 使用者購買的方案擁有的堂數
    const userCredit = await creditPurchaseRepo.sum("purchased_credits", {
      user_id: id,
    });
    // 使用者已報名的課程數
    const userUsedCredit = await courseBookingRepo.count({
      where: {
        user_id: id,
        cancelledAt: IsNull(),
      },
    });
    // 該課程被報名的數量
    const courseBookingCount = await courseBookingRepo.count({
      where: {
        course_id: courseId,
        cancelledAt: IsNull(),
      },
    });

    if (userUsedCredit >= userCredit) {
      return next(BadRequest("已無可使用堂數"));
    } else if (courseBookingCount >= course.max_participants) {
      return next(BadRequest("已達最大參加人數，無法參加"));
    }

    const newCourseBooking = courseBookingRepo.create({
      user_id: id,
      course_id: courseId,
      bookingAt: new Date().toISOString(),
    });

    await courseBookingRepo.save(newCourseBooking);

    sendSuccess(res, {
      message: "報名成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
);

// 取消課程
// DELETE /api/courses/:courseId
router.delete(
  "/:courseId",
  validateId("courseId"),
  isAuth,
  catchAsync(async (req, res, next) => {
    const courseBookingRepo = dataSource.getRepository("CourseBooking");

    const { id } = req.user;
    const { courseId } = req.params;

    // 找不到課程
    const userCourseBooking = await courseBookingRepo.findOne({
      where: {
        user_id: id,
        course_id: courseId,
        cancelledAt: IsNull(),
      },
    });
    if (!userCourseBooking) {
      return next(BadRequest("課程不存在或已被取消"));
    }

    await courseBookingRepo.update(
      {
        user_id: id,
        course_id: courseId,
        cancelledAt: IsNull(),
      },
      {
        cancelledAt: new Date().toISOString(),
      },
    );

    sendSuccess(res, {
      message: "課程取消成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
);

module.exports = router;
