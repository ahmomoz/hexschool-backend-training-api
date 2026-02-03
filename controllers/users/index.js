const userService = require("@/services/user");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");

const userController = {
  signup: catchAsync(async (req, res, next) => {
    const userData = req.body;
    const userResponse = await userService.signup(userData);

    sendSuccess(res, {
      data: userResponse,
      message: "註冊成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),

  login: catchAsync(async (req, res, next) => {
    const userData = req.body;
    const userResponse = await userService.login(userData);

    sendSuccess(res, {
      data: userResponse,
      message: "登入成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),

  getProfile: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const responseUser = await userService.getProfile(id);

    sendSuccess(res, {
      data: responseUser,
      message: "查詢成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),

  updateProfile: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const userData = req.body;

    await userService.updateProfile(id, userData);

    sendSuccess(res, {
      message: "更新成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
};

module.exports = userController;
