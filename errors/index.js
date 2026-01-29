const { AppError } = require("./appError.js");
const { HTTP_STATUS } = require("../constants/httpStatus.js");

const BadRequest = (message, data = null) =>
  new AppError({ message, statusCode: HTTP_STATUS.BAD_REQUEST, data });

const NotFound = (message = "資料不存在") =>
  new AppError({ message, statusCode: HTTP_STATUS.NOT_FOUND });

const Conflict = (message = "資料重複", data = null) =>
  new AppError({ message, statusCode: HTTP_STATUS.CONFLICT, data });

module.exports = { BadRequest, NotFound, Conflict };
