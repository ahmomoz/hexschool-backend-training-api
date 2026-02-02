const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Skill");

const { validate } = require("@/middlewares/validate.middleware");

const {
  createSkillSchema,
  skillIdSchema,
} = require("@/validations/skill.schema");

const skillController = require("@/controllers/admin/coaches/skill.controller");

// 取得教練專長列表
// GET /api/admin/coaches/skill
router.get("/", skillController.getSkills);

// 新增教練專長
// POST /api/admin/coaches/skill
router.post("/", validate(createSkillSchema), skillController.createSkill);

// 刪除教練專長
// DELETE /api/admin/coaches/skill/:skillId
router.delete(
  "/:skillId",
  validate(skillIdSchema, "params"),
  skillController.deleteSkill,
);

module.exports = router;
