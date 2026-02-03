const { dataSource } = require("@/db/data-source");
const { BadRequest } = require("@/errors");

const userRepo = dataSource.getRepository("User");
const skillRepo = dataSource.getRepository("Skill");
const courseRepo = dataSource.getRepository("Course");

const courseService = {
  /**
   * 新增課程
   * @param {Object} courseData
   */
  async createCourse(courseData) {
    const { user_id, skill_id, ...otherDetails } = courseData;

    // 並行檢查 (效能優化：同時查詢使用者與技能)
    const [existingUser, existingSkill] = await Promise.all([
      userRepo.findOne({ select: ["id"], where: { id: user_id } }),
      skillRepo.findOne({ select: ["id"], where: { id: skill_id } }),
    ]);

    if (!existingUser) throw BadRequest("使用者不存在");
    if (!existingSkill) throw BadRequest("課程所需的技能不存在");

    // 建立實體並儲存
    const newCourse = courseRepo.create({
      user_id,
      skill_id,
      ...otherDetails,
    });

    const savedCourse = await courseRepo.save(newCourse);

    // 調整順序
    const { id, ...rest } = savedCourse;

    return {
      id,
      ...rest,
    };
  },

  /**
   * 更新課程
   * @param {string|number} courseId
   * @param {Object} updateData
   */
  async updateCourse(courseId, updateData) {
    const { skill_id } = updateData;

    const existingCourse = await courseRepo.findOneBy({ id: courseId });
    if (!existingCourse) throw BadRequest("課程不存在");

    if (skill_id) {
      const existingSkill = await skillRepo.findOneBy({ id: skill_id });
      if (!existingSkill) throw BadRequest("更新的技能不存在");
    }

    // 執行更新並合併資料 (merge 會將新資料蓋過舊資料，但不存入 DB)
    const updatedCourse = courseRepo.merge(existingCourse, updateData);

    // 儲存並回傳 (save 會自動處理 updated_at)
    return await courseRepo.save(updatedCourse);
  },
};

module.exports = courseService;
