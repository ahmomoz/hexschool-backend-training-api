const { z } = require("zod");

const createCoachSchema = z.object({
  experience_years: z.number().int("教練年資必須是整數"),
  description: z.string().min(1, "教練簡介為必填"),
  profile_image_url: z
    .string()
    .optional()
    .refine((val) => !val || /\.(jpg|jpeg|png)$/i.test(val), {
      message: "圖片格式必須為 .jpg 或 .png",
    }),
});

const coachIdSchema = z.object({
  coachId: z.string().uuid("格式錯誤"),
});

module.exports = { createCoachSchema, coachIdSchema };