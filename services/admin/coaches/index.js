const { dataSource } = require("@/db/data-source");
const { Conflict, BadRequest } = require("@/errors");

const userRepo = dataSource.getRepository("User");
const coachRepo = dataSource.getRepository("Coach");

const coachService = {
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
   * 取得教練列表
   * @param {number} per 每頁筆數
   * @param {number} page 頁碼
   * @returns {Promise<Array<Object>>} 教練列表
   */
  async getCoachList(per, page) {
    // 使用 find 取代 findAndCount (若不需要總數回傳)
    const coaches = await coachRepo.find({
      skip: (page - 1) * per,
      take: per,
      relations: {
        User: true,
      },
      // 只抓取必要的欄位，優化效能
      select: {
        id: true,
        User: {
          name: true,
        },
      },
    });

    return coaches.map((coach) => ({
      id: coach.id,
      name: coach.User?.name,
    }));
  },

  /**
   * 取得教練詳細資訊
   * @param {string} coachId 教練 ID
   * @returns {Promise<Object>} 教練詳細資訊 (包含使用者資訊)
   */
  async getCoachById(coachId) {
    const coach = await coachRepo.findOne({
      where: { id: coachId },
      relations: {
        User: true,
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
      },
    });

    if (!coach) throw BadRequest("找不到該教練");

    // 透過結構賦值優雅地拆分 User 與 Coach 資訊
    const { User, ...coachInfo } = coach;

    return {
      user: User,
      coach: coachInfo,
    };
  },
};

module.exports = coachService;
