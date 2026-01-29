const { HTTP_STATUS } = require("@/constants/httpStatus.js");

const globalErrorHandler = (err, req, res, next) => {
  let { statusCode, message, data, isOperational } = err;

  // 預設為伺服器錯誤
  statusCode = statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    status: isOperational ? "failed" : "error",
    message: message || "系統發生預期外的錯誤",
    data,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { globalErrorHandler };
