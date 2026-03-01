const { dataSource } = require("@/db/data-source");
const { BadRequest } = require("@/errors");

const courseRepo = dataSource.getRepository("Course");
const coachRepo = dataSource.getRepository("Coach");

const coachService = {
  /**
   * 取得教練列表
   * @param {number} per 每頁筆數
   * @param {number} page 頁碼
   * @returns {Promise<Array<Object>>} 教練列表
   */
  async getCoaches(per, page) {
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
  async getCoach(coachId) {
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

    const { User, ...coachInfo } = coach;

    return {
      user: User,
      coach: coachInfo,
    };
  },

  /**
   * @description 取得指定教練課程列表
   * @param {string} coachId - 教練 id
   * @returns {Promise<Array<object>>} 課程列表
   */
  async getCoachCourses(coachId) {
    const coach = await coachRepo.findOne({
      where: { id: coachId },
      select: ["user_id"],
    });
    if (!coach) throw BadRequest("找不到該教練");

    const courses = await courseRepo.find({
      where: { user_id: coach.user_id },
      relations: {
        User: true,
        Skill: true,
      },
    });

    return courses.map((course) => ({
      id: course.id,
      coach_name: course.User?.name,
      skill_name: course.Skill?.name,
      name: course.name,
      description: course.description,
      start_at: course.start_at,
      end_at: course.end_at,
      max_participants: course.max_participants,
    }));
  },
};

module.exports = coachService;
