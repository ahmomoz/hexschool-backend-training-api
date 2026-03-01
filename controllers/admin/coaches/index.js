const adminCoachService = require("@/services/admin/coaches");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");

const adminCoachController = {
  // 將使用者新增為教練
  createCoach: catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const coachData = req.body;
    const savedData = await adminCoachService.createCoach(userId, coachData);

    sendSuccess(res, {
      data: savedData,
      message: "新增成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
};

module.exports = adminCoachController;
