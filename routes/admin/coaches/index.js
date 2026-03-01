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

module.exports = router;
