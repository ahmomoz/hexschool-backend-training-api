const { z } = require("zod");

const createCreditPackageSchema = z.object({
  name: z.string().min(1, "方案名稱為必填"),
  credit_amount: z.coerce.number().min(1, "課堂數量為必填"),
  price: z.coerce.number().min(1, "價格為必填"),
});

const createCreditIdSchema = z.object({
  creditPackageId: z.string().uuid("格式錯誤"),
});

module.exports = { createCreditPackageSchema, createCreditIdSchema };
