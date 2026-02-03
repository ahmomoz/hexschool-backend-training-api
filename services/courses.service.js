const { IsNull } = require("typeorm");
const { dataSource } = require("@/db/data-source");
const { BadRequest } = require("@/errors");

const courseRepo = dataSource.getRepository("Course");
const courseBookingRepo = dataSource.getRepository("CourseBooking");
const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");

const courseService = {
  /**
   * @description 取得課程列表
   * @param {number} per - 每頁顯示筆數
   * @param {number} page - 頁碼
   * @returns {Promise<Array<object>>} 課程列表
   */
  async getCourses(per, page) {
    const [courses] = await courseRepo.findAndCount({
      skip: (page - 1) * per,
      take: per,
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

  /**
   * @description 報名課程
   * @param {string} userId - 使用者 ID
   * @param {string} courseId - 課程 ID
   * @returns {Promise<void>}
   */
  async createCourse(userId, courseId) {
    // 找不到課程
    const course = await courseRepo.findOneBy({ id: courseId });
    if (!course) throw BadRequest("找不到此課程");

    // 已報名過此課程
    const isBooking = await courseBookingRepo.findOneBy({
      user_id: userId,
      course_id: courseId,
    });
    if (isBooking) throw BadRequest("已經報名過此課程");

    // 使用者購買的方案擁有的堂數
    const userCredit = await creditPurchaseRepo.sum("purchased_credits", {
      user_id: userId,
    });
    // 使用者已報名的課程數
    const userUsedCredit = await courseBookingRepo.count({
      where: {
        user_id: userId,
        cancelledAt: IsNull(),
      },
    });
    // 該課程被報名的數量
    const courseBookingCount = await courseBookingRepo.count({
      where: {
        course_id: courseId,
        cancelledAt: IsNull(),
      },
    });

    if (userUsedCredit >= userCredit) {
      throw BadRequest("已無可使用堂數");
    } else if (courseBookingCount >= course.max_participants) {
      throw BadRequest("已達最大參加人數，無法參加");
    }

    const newCourseBooking = courseBookingRepo.create({
      user_id: userId,
      course_id: courseId,
      bookingAt: new Date().toISOString(),
    });

    await courseBookingRepo.save(newCourseBooking);
  },

  /**
   * @description 取消報名課程
   * @param {string} userId - 使用者 ID
   * @param {string} courseId - 課程 ID
   * @returns {Promise<void>}
   */
  async deleteCourse(userId, courseId) {
    // 找不到課程
    const userCourseBooking = await courseBookingRepo.findOne({
      where: {
        user_id: userId,
        course_id: courseId,
        cancelledAt: IsNull(),
      },
    });
    if (!userCourseBooking) BadRequest("課程不存在或已被取消");

    await courseBookingRepo.update(
      {
        user_id: userId,
        course_id: courseId,
        cancelledAt: IsNull(),
      },
      {
        cancelledAt: new Date().toISOString(),
      },
    );
  },
};

module.exports = courseService;
