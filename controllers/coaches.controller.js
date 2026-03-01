const coachService = require("@/services/coaches.service");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");

const coachController = {
  // 取得教練列表
  getCoaches: catchAsync(async (req, res) => {
    const { per, page } = req.query;

    const coachList = await coachService.getCoaches(per, page);

    sendSuccess(res, { data: coachList, message: "查詢成功" });
  }),

  // 取得教練詳細
  getCoach: catchAsync(async (req, res) => {
    const { coachId } = req.params;

    const data = await coachService.getCoach(coachId);

    sendSuccess(res, {
      data: data,
      message: "查詢成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),

  // 取得指定教練課程列表
  getCoachCourses: catchAsync(async (req, res) => {
    const { coachId } = req.params;
    const courses = await coachService.getCoachCourses(coachId);

    sendSuccess(res, {
      data: courses,
      message: "查詢成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
};

module.exports = coachController;
