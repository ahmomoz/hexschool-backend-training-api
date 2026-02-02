const { z } = require("zod");

const userIdSchema = z.object({
  userId: z.string().uuid("格式錯誤"),
});

module.exports = { userIdSchema };
