const { HTTP_STATUS } = require("../constants/httpStatus");

/**
 * 統一成功回應格式
 * @param {Response} res
 * @param {object} options
 * @param {any} [options.data] 回傳資料
 * @param {string} [options.message] 提示訊息
 * @param {number} [options.statusCode] HTTP status code
 */
const sendSuccess = (
  res,
  { data = null, message = "成功", statusCode = HTTP_STATUS.OK } = {},
) => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

module.exports = { sendSuccess };
