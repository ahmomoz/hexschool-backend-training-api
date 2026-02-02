const { dataSource } = require("@/db/data-source");
const { BadRequest } = require("@/errors");

const userRepo = dataSource.getRepository("User");
const skillRepo = dataSource.getRepository("Skill");
const courseRepo = dataSource.getRepository("Course");

const courseService = {
  // 新增課程
  async createCourse(courseData) {
    const {
      user_id,
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = courseData;

    const existingUser = await userRepo.findOne({
      select: ["id", "role"],
      where: {
        id: user_id,
      },
    });
    const existingSkill = await skillRepo.findOneBy({ id: skill_id });

    if (!existingUser) throw BadRequest("使用者不存在");
    if (!existingSkill) throw BadRequest("課程所需的技能不存在");

    const newCourse = courseRepo.create({
      user_id,
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    });
    const createdCourse = await courseRepo.save(newCourse);
    return {
      id: createdCourse.id,
      user_id: createdCourse.user_id,
      skill_id: createdCourse.skill_id,
      name: createdCourse.name,
      description: createdCourse.description,
      start_at: createdCourse.start_at,
      end_at: createdCourse.end_at,
      max_participants: createdCourse.max_participants,
      meeting_url: createdCourse.meeting_url,
      created_at: createdCourse.created_at,
      update_at: createdCourse.update_at,
    };
  },

  // 更新課程
  async updateCourse(courseId, courseData) {
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = courseData;

    const existingCourse = await courseRepo.findOneBy({ id: courseId });
    if (!existingCourse) throw BadRequest("課程不存在");

    const existingSkill = await skillRepo.findOneBy({ id: skill_id });
    if (!existingSkill) throw BadRequest("課程所需的技能不存在");

    await courseRepo.update(
      { id: courseId },
      {
        skill_id,
        name,
        description,
        start_at,
        end_at,
        max_participants,
        meeting_url,
      },
    );

    const updateCourse = await courseRepo.findOneBy({ id: courseId });

    return updateCourse;
  },
};

module.exports = courseService;
