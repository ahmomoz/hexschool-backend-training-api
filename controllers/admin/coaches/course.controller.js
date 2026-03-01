const adminCourseService = require("@/services/admin/coaches/course.service");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");

const adminCourseController = {
  getCourses: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const courses = await adminCourseService.getCourses(id);

    sendSuccess(res, {
      data: courses,
      message: "查詢成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),

  getCourse: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { courseId } = req.params;
    const course = await adminCourseService.getCourse(id, courseId);

    sendSuccess(res, {
      data: course,
      message: "查詢成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),

  createCourse: catchAsync(async (req, res, next) => {
    const courseData = req.body;
    const createdData = await adminCourseService.createCourse(courseData);

    sendSuccess(res, {
      data: createdData,
      message: "新增成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),

  updateCourse: catchAsync(async (req, res, next) => {
    const { courseId } = req.params;
    const courseData = req.body;

    const updatedCourse = await adminCourseService.updateCourse(
      courseId,
      courseData,
    );

    sendSuccess(res, {
      data: updatedCourse,
      message: "更新成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
};

module.exports = adminCourseController;
