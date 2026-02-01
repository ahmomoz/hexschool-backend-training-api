const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Skill");
const { z } = require("zod");
const { dataSource } = require("@/db/data-source");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");
const { Conflict, NotFound } = require("@/errors");
const { validate, validateId } = require("@/middlewares/validate.middleware");

const createSkillSchema = z.object({
  name: z.string().min(1, "技能名稱為必填"),
});

// 取得教練專長列表
// GET /api/coaches/skill
router.get(
  "/",
  catchAsync(async (req, res) => {
    const skills = await dataSource.getRepository("Skill").find();

    const skillList = skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
    }));

    sendSuccess(res, { data: skillList, message: "查詢成功" });
  }),
);

// 新增教練專長
// POST /api/coaches/skill
router.post(
  "/",
  validate(createSkillSchema),
  catchAsync(async (req, res, next) => {
    const skillRepo = dataSource.getRepository("Skill");
    const { name } = req.body;

    const existingSkill = await skillRepo.findOneBy({ name });

    if (existingSkill) {
      return next(Conflict("資料重複"));
    }

    const newSkill = skillRepo.create({
      name,
    });
    const createdSkill = await skillRepo.save(newSkill);
    const skillResponse = await skillRepo.findOneBy({ id: createdSkill.id });

    sendSuccess(res, {
      data: skillResponse,
      message: "新增成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
);

// 刪除教練專長
// DELETE /api/coaches/skill/:skillId
router.delete(
  "/:skillId",
  validateId("skillId"),
  catchAsync(async (req, res, next) => {
    const skillRepo = dataSource.getRepository("Skill");
    const { skillId } = req.params;

    const existingSkill = await skillRepo.findOneBy({ id: skillId });

    if (!existingSkill) {
      return next(NotFound("找不到此技能"));
    }

    await skillRepo.delete({ id: skillId });

    sendSuccess(res, { message: "刪除成功" });
  }),
);

module.exports = router;
