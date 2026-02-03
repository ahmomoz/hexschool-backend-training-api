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

  // 取得教練列表
  getCoachList: catchAsync(async (req, res) => {
    const { per, page } = req.query;

    const coachList = await adminCoachService.getCoachList(per, page);

    sendSuccess(res, { data: coachList, message: "查詢成功" });
  }),

  // 取得教練詳細
  getCoaches: catchAsync(async (req, res) => {
    const { coachId } = req.params;

    const data = await adminCoachService.getCoaches(coachId);

    sendSuccess(res, {
      data: data,
      message: "查詢成功",
    });
  }),
};

module.exports = adminCoachController;
