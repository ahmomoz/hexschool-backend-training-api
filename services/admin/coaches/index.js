const { dataSource } = require("@/db/data-source");
const { Conflict, BadRequest } = require("@/errors");

const userRepo = dataSource.getRepository("User");

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
};

module.exports = adminCoachService;
