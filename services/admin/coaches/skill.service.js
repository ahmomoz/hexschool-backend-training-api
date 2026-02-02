const { dataSource } = require("@/db/data-source");
const { Conflict, BadRequest } = require("@/errors");

const skillRepo = dataSource.getRepository("Skill");

const skillService = {
  // 取得列表並處理格式轉換
  async getSkillList() {
    const skills = await skillRepo.find();
    return skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
    }));
  },

  // 新增技能
  async createSkill(name) {
    const existingSkill = await skillRepo.findOneBy({ name });
    if (existingSkill) throw Conflict("資料重複");

    const newSkill = skillRepo.create({ name });
    const skill = await skillRepo.save(newSkill);
    return {
      id: skill.id,
      name: skill.name,
    };
  },

  // 刪除技能
  async deleteSkill(id) {
    const existingSkill = await skillRepo.findOneBy({ id });
    if (!existingSkill) throw BadRequest("找不到此技能");

    return await skillRepo.delete({ id });
  },
};

module.exports = skillService;
