const adminCoachController = require("@/controllers/admin/coaches");

const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Coach");

const { z } = require("zod");
const { validate } = require("@/middlewares/validate.middleware");

const { userIdSchema } = require("@/validations/user.schema");
const {
  createCoachSchema,
  updateCoachSchema,
} = require("@/validations/coach.schema");

// 將使用者新增為教練
// POST /api/admin/coaches/:userId
router.post(
  "/:userId",
  validate(createCoachSchema),
  validate(userIdSchema, "params"),
  adminCoachController.createCoach,
);

// 取得教練自己的詳細資訊
// GET /api/admin/coaches
router.get("/", adminCoachController.getCoach);

// 變更教練資料
// PUT /api/admin/coaches
router.put("/", validate(updateCoachSchema), adminCoachController.updateCoach);

// 取得教練自己的月營收資料
// GET /api/admin/coaches/revenue?month=
router.get("/revenue", adminCoachController.getMonthRevenue);

module.exports = router;
