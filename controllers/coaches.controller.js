const coachService = require("@/services/coaches.service");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");

const coachController = {
  getCoachCourses: catchAsync(async (req, res) => {
    const { coachId } = req.params;
    const courseList = await coachService.getCoachCourses(coachId);

    sendSuccess(res, {
      data: courseList,
      message: "查詢成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
};

module.exports = coachController;
