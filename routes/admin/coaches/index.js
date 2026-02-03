const adminCoachController = require("@/controllers/admin/coaches");

const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Coach");

const { z } = require("zod");
const { validate } = require("@/middlewares/validate.middleware");

const { userIdSchema } = require("@/validations/user.schema");
const {
  createCoachSchema,
  coachIdSchema,
} = require("@/validations/coach.schema");

// 將使用者新增為教練
// POST /api/admin/coaches/:userId
router.post(
  "/:userId",
  validate(createCoachSchema),
  validate(userIdSchema, "params"),
  adminCoachController.createCoach,
);

// 取得教練列表
// GET /api/coaches/?per=?page=?
router.get(
  "/",
  validate(
    z.object({
      per: z.coerce.number().int().min(1).default(10),
      page: z.coerce.number().int().min(1).default(1),
    }),
    "query",
  ),
  adminCoachController.getCoachList,
);

// 取得教練詳細資訊
// GET /api/coaches/:coachId
router.get(
  "/:coachId",
  validate(coachIdSchema, "params"),
  adminCoachController.getCoachById,
);

module.exports = router;
