const { z } = require("zod");

const baseUserSchema = z.object({
  name: z
    .string()
    .min(2, "使用者名稱最少 2 個字")
    .max(10, "使用者名稱最多 10 個字")
    .regex(
      /^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
      "使用者名稱不可包含任何特殊符號與空白",
    ),
  email: z.string().email("請輸入正確的電子郵件格式"),
  password: z
    .string()
    .min(8, "密碼最短需 8 個字")
    .max(16, "密碼最長 16 個字")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密碼必須包含英文大小寫及數字"),
});

const loginUserSchema = baseUserSchema.omit({
  name: true,
});

const putUserSchema = baseUserSchema.pick({
  name: true,
});

const userIdSchema = z.object({
  userId: z.string().uuid("格式錯誤"),
});

module.exports = {
  baseUserSchema,
  loginUserSchema,
  putUserSchema,
  userIdSchema,
};
