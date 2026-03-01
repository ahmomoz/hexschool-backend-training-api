const { dataSource } = require("@/db/data-source");
const { BadRequest } = require("@/errors");

const courseRepo = dataSource.getRepository("Course");
const coachRepo = dataSource.getRepository("Coach");

const coachService = {
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
