const { z } = require("zod");

const createSkillSchema = z.object({
  name: z.string().min(1, "技能名稱為必填"),
});

const skillIdSchema = z.object({
  skillId: z.string().uuid("格式錯誤"),
});

module.exports = { createSkillSchema, skillIdSchema };