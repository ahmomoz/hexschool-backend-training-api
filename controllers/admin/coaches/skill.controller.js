const adminSkillService = require("@/services/admin/coaches/skill.service");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");

const adminSkillController = {
  getSkills: catchAsync(async (req, res) => {
    const data = await adminSkillService.getSkills();
    sendSuccess(res, { data, message: "查詢成功" });
  }),

  createSkill: catchAsync(async (req, res) => {
    const { name } = req.body;
    const data = await adminSkillService.createSkill(name);
    sendSuccess(res, {
      data,
      message: "新增成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),

  deleteSkill: catchAsync(async (req, res) => {
    const { skillId } = req.params;
    await adminSkillService.deleteSkill(skillId);
    sendSuccess(res, { message: "刪除成功" });
  }),
};

module.exports = adminSkillController;
