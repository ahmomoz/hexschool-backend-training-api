const courseService = require("@/services/courses.service");

const logger = require("@/utils/logger")("Course");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");

const courseController = {
  getCourses: catchAsync(async (req, res) => {
    const { per, page } = req.query;
    const courseList = await courseService.getCourses(per, page);

    sendSuccess(res, { data: courseList, message: "查詢成功" });
  }),

  createCourse: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { courseId } = req.params;
    await courseService.createCourse(id, courseId);

    sendSuccess(res, {
      message: "報名成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),

  deleteCourse: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { courseId } = req.params;
    await courseService.deleteCourse(id, courseId);

    sendSuccess(res, {
      message: "課程取消成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
};

module.exports = courseController;
