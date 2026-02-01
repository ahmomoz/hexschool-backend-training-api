const { z } = require("zod");
const { BadRequest } = require("@/errors");

const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    try {
      // 驗證 req[source]，成功後將乾淨的資料放回 req[source]
      req[source] = schema.parse(req[source]);
      next();
    } catch (err) {
      // 驗證失敗，將錯誤傳給全域處理中間件
      if (err.name === "ZodError") {
        // ZodError 的詳細錯誤資訊位於 issues 屬性中
        const message = (err.issues || []).map((e) => e.message).join(", ");
        next(BadRequest(message));
        return;
      }
      next(err);
    }
  };

/**
 * 驗證 params 中的 UUID 參數
 * @param {string} paramName - 參數名稱，例如 "userId", "coachId"
 */
const validateId = (paramName) => {
  const schema = z.object({
    [paramName]: z.string().uuid(`${paramName} 格式不正確`),
  });
  return validate(schema, "params");
};

module.exports = { validate, validateId };
