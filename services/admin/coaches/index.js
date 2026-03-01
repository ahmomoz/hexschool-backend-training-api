const { dataSource } = require("@/db/data-source");
const { Conflict, BadRequest } = require("@/errors");

const userRepo = dataSource.getRepository("User");
const coachRepo = dataSource.getRepository("Coach");

const adminCoachService = {
  /**
   * 將使用者新增為教練 (包含 Transaction 處理)
   * @param {Object} coachData
   * @returns {Promise<Object>} 包含使用者與教練資料的物件
   */
  async createCoach(userId, coachData) {
    const {
      experience_years,
      description,
      profile_image_url = null,
    } = coachData;

    // 檢查使用者狀態
    const user = await userRepo.findOne({
      select: ["id", "name", "role"],
      where: { id: userId },
    });

    if (!user) throw BadRequest("找不到使用者");
    if (user.role === "COACH") throw Conflict("使用者已經是教練");

    // 使用 Transaction 確保 User 角色更新與 Coach 建立同時成功或失敗
    return await dataSource.transaction(async (manager) => {
      // 更新使用者角色 (使用實體名稱 "User")
      await manager.update("User", { id: userId }, { role: "COACH" });

      // 建立教練資料
      // 使用 manager.create 確保所有動作都在同一個管理員視角下
      const newCoach = manager.create("Coach", {
        user_id: userId,
        experience_years,
        description,
        profile_image_url,
      });

      const savedCoach = await manager.save(newCoach);

      return {
        user: { id: userId, role: "COACH" },
        coach: savedCoach,
      };
    });
  },

  /**
   * 取得教練自己的詳細資訊
   * @param {string} id 使用者 ID
   * @returns {Promise<Object>} 教練詳細資訊
   */
  async getCoach(id) {
    const coach = await coachRepo.findOne({
      where: { user_id: id },
      relations: {
        User: true,
        CoachLinkSkill: true,
      },
      select: {
        id: true,
        user_id: true,
        experience_years: true,
        description: true,
        profile_image_url: true,
        created_at: true,
        updated_at: true,
        User: {
          name: true,
          role: true,
        },
        CoachLinkSkill: {
          id: true,
        },
      },
    });

    if (!coach) throw BadRequest("找不到教練");

    return {
      id: coach.id,
      experience_years: coach.experience_years,
      description: coach.description,
      profile_image_url: coach.profile_image_url,
      skill_ids: coach.CoachLinkSkill.map((skill) => skill.id),
    };
  },

  /**
   * 變更教練資料
   * @param {Object} coachData
   * @returns {Promise<Object>} 包含使用者與教練資料的物件
   */
  async updateCoach(userId, coachData) {
    const {
      experience_years,
      description,
      profile_image_url = null,
    } = coachData;

    const existingCoach = await coachRepo.findOne({
      where: { user_id: userId },
      relations: { CoachLinkSkill: true },
    });

    if (!existingCoach) throw BadRequest("找不到教練");

    existingCoach.experience_years = experience_years;
    existingCoach.description = description;
    existingCoach.profile_image_url = profile_image_url;

    const savedCoach = await coachRepo.save(existingCoach);

    return {
      id: savedCoach.id,
      experience_years: savedCoach.experience_years,
      description: savedCoach.description,
      profile_image_url: savedCoach.profile_image_url,
      skill_ids: savedCoach.CoachLinkSkill.map((skill) => skill.id),
    };
  },
};

module.exports = adminCoachService;
