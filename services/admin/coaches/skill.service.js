const { dataSource } = require("@/db/data-source");
const { Conflict, BadRequest } = require("@/errors");

const skillRepo = dataSource.getRepository("Skill");

const skillService = {
  /**
   * 取得技能列表
   * 透過 select 限制欄位，避免在記憶體中使用 map 處理大量資料
   * @returns {Promise<Array<Object>>} 技能列表
   */
  async getSkillList() {
    return await skillRepo.find({
      select: ["id", "name"],
    });
  },

  /**
   * 新增技能
   * @param {string} name 技能名稱
   * @returns {Promise<Object>} 新增的技能資料
   */
  async createSkill(name) {
    // 檢查是否存在
    const existingSkill = await skillRepo.findOneBy({ name });
    if (existingSkill) throw Conflict("技能名稱已存在");

    const newSkill = skillRepo.create({ name });
    const savedSkill = await skillRepo.save(newSkill);

    return {
      id: savedSkill.id,
      name: savedSkill.name,
    };
  },

  /**
   * 刪除技能
   * @param {string} id 技能 ID
   * @returns {Promise<Object>} 刪除結果
   */
  async deleteSkill(id) {
    // 檢查是否存在，不存在應回傳 404
    const existingSkill = await skillRepo.findOneBy({ id });
    if (!existingSkill) throw BadRequest("找不到此技能");

    return await skillRepo.remove(existingSkill);
  },
};

module.exports = skillService;
