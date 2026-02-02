const { dataSource } = require("@/db/data-source");
const { Conflict, BadRequest } = require("@/errors");

const userRepo = dataSource.getRepository("User");
const coachRepo = dataSource.getRepository("Coach");

const coachService = {
  // 將使用者新增為教練
  async createCoach(userId, coachData) {
    const {
      experience_years: experienceYears,
      description,
      profile_image_url: profileImageUrl = null,
    } = coachData;

    const existingUser = await userRepo.findOne({
      select: ["id", "name", "role"],
      where: {
        id: userId,
      },
    });

    if (!existingUser) throw BadRequest("找不到使用者");

    if (existingUser.role === "COACH") throw Conflict("使用者已經是教練");

    const newCoach = coachRepo.create({
      user_id: userId,
      experience_years: experienceYears,
      description,
      profile_image_url: profileImageUrl,
    });

    await userRepo.update(
      {
        id: userId,
        role: "USER",
      },
      {
        role: "COACH",
      },
    );

    const savedCoach = await coachRepo.save(newCoach);
    const savedUser = await userRepo.findOne({
      select: ["name", "role"],
      where: { id: userId },
    });

    return {
      user: savedUser,
      coach: savedCoach,
    };
  },

  // 取得教練列表
  async getCoachList(per, page) {
    const [coaches] = await coachRepo.findAndCount({
      skip: (page - 1) * per,
      take: per,
      relations: {
        User: true,
      },
    });

    const coachList = coaches.map((coach) => ({
      id: coach.id,
      name: coach.User?.name,
    }));

    return coachList;
  },

  // 取得教練詳細
  async getCoach(coachId) {
    const existingCoach = await coachRepo.findOne({
      where: {
        id: coachId,
      },
      select: {
        User: {
          name: true,
          role: true,
        },
      },
      relations: ["User"],
    });
    if (!existingCoach) throw BadRequest("找不到該教練");

    const user = { ...existingCoach.User };
    const coach = { ...existingCoach, User: undefined };

    return { user: user, coach: coach };
  },
};

module.exports = coachService;
