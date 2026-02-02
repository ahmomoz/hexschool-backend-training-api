const { z } = require("zod");

const baseCourseSchema = z.object({
  user_id: z.string().uuid("無效的使用者 ID 格式"),
  skill_id: z.string().uuid("無效的技能 ID 格式"),
  name: z.string().min(1, "課程名稱為必填"),
  description: z.string().min(1, "課程介紹為必填"),
  start_at: z.string().min(1, "課程開始時間為必填"),
  end_at: z.string().min(1, "課程結束時間為必填"),
  max_participants: z.number().min(1, "最大上課人數為必填"),
  meeting_url: z.string().url("線上直播網址格式需為網址").optional(),
});
const createCourseSchema = baseCourseSchema;
const putCourseSchema = baseCourseSchema
  .omit({
    user_id: true,
  })
  .extend({
    meeting_url: z
      .string()
      .min(1, "線上直播網址為必填")
      .url("線上直播網址格式需為網址"),
  });

const courseIdSchema = z.object({
  courseId: z.string().uuid("格式錯誤"),
});

module.exports = {
  baseCourseSchema,
  createCourseSchema,
  putCourseSchema,
  courseIdSchema,
};
