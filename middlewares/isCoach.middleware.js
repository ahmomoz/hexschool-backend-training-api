const { HTTP_STATUS } = require("@/constants/httpStatus");

const FORBIDDEN_MESSAGE = "使用者尚未成為教練";

function generateError(
  status = HTTP_STATUS.PERMISSION_DENIED,
  message = FORBIDDEN_MESSAGE,
) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "COACH") {
    next(generateError());
    return;
  }
  next();
};
