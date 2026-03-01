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

  // 取得教練自己的詳細資訊
  getCoach: catchAsync(async (req, res) => {
    const { id } = req.user;

    const data = await adminCoachService.getCoach(id);

    sendSuccess(res, {
      data: data,
      message: "查詢成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),

  // 變更教練資料
  updateCoach: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const coachData = req.body;
    const updateData = await adminCoachService.updateCoach(id, coachData);

    sendSuccess(res, {
      data: updateData,
      message: "更新成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),

  // 取得教練自己的月營收資料
  getMonthRevenue: catchAsync(async (req, res) => {
    const { id } = req.user;
    const { month } = req.query;

    const data = await adminCoachService.getMonthRevenue(id, month);

    sendSuccess(res, {
      data: data,
      message: "查詢成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
};

module.exports = adminCoachController;
