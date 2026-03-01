const config = require("@/config/index");
const generateJWT = require("@/utils/generateJWT");

const { dataSource } = require("@/db/data-source");
const { Conflict, BadRequest } = require("@/errors");
const { hashPassword, comparePassword } = require("@/utils/password");
const { IsNull } = require("typeorm");

const userRepo = dataSource.getRepository("User");
const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
const courseBookingRepo = dataSource.getRepository("CourseBooking");

const userService = {
  /**
   * @description 註冊新使用者
   * @param {object} userData - 使用者資料
   * @param {string} userData.name - 使用者名稱
   * @param {string} userData.email - 使用者 Email
   * @param {string} userData.password - 使用者密碼
   * @returns {Promise<object>} 包含新使用者 ID 和名稱的物件
   */
  async signup(userData) {
    const { name, email, password } = userData;

    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) throw Conflict("Email 已被使用");

    const hashedPassword = await hashPassword(password);

    const newUser = userRepo.create({
      name,
      email,
      password: hashedPassword,
      role: "USER",
    });

    const savedUser = await userRepo.save(newUser);

    return {
      id: savedUser.id,
      name: savedUser.name,
    };
  },

  /**
   * @description 使用者登入
   * @param {object} userData - 使用者資料
   * @param {string} userData.email - 使用者 Email
   * @param {string} userData.password - 使用者密碼
   * @returns {Promise<object>} 包含 JWT Token 和使用者名稱的物件
   */
  async login(userData) {
    const { email, password } = userData;

    // 尋找使用者（抓取 password 欄位進行比對）
    const user = await userRepo.findOne({
      where: { email },
      select: ["id", "name", "password", "role"], // 確保包含 password 欄位
    });

    // 無論使用者是否存在，都進行一次密碼比對動作（防止計時攻擊）
    const isPasswordMatch = user
      ? await comparePassword(password, user.password)
      : false;

    if (!user || !isPasswordMatch)
      throw BadRequest("使用者不存在或密碼輸入錯誤");

    // 產生 JWT Token (包含 role，減少後續 middleware 查表的次數)
    const token = await generateJWT(
      {
        id: user.id,
        role: user.role,
      },
      config.get("secret.jwtSecret"),
      {
        expiresIn: config.get("secret.jwtExpiresDay"),
      },
    );

    return {
      token,
      user: {
        name: user.name,
      },
    };
  },

  /**
   * @description 使用者更新密碼
   * @param {object} passwordData - 密碼資料
   * @param {string} passwordData.password - 使用者密碼
   * @param {string} passwordData.new_password - 使用者新密碼
   * @param {string} passwordData.confirm_new_password - 使用者確認密碼
   */
  async updatePassword(userId, passwordData) {
    const { password, new_password } = passwordData;

    // 尋找使用者（抓取 password 欄位進行比對）
    const user = await userRepo.findOne({
      where: { id: userId },
      select: ["id", "password"],
    });

    // 無論使用者是否存在，都進行一次密碼比對動作（防止計時攻擊）
    const isPasswordMatch = user
      ? await comparePassword(password, user.password)
      : false;
    if (!user || !isPasswordMatch)
      throw BadRequest("使用者不存在或密碼輸入錯誤");

    const isPasswordConflict = await comparePassword(
      new_password,
      user.password,
    );
    if (isPasswordConflict) throw BadRequest("新密碼不能與舊密碼相同");

    const hashedNewPassword = await hashPassword(new_password);

    await userRepo.update({ id: userId }, { password: hashedNewPassword });
  },

  /**
   * @description 根據 ID 取得使用者個人資料
   * @param {string} userId - 使用者 ID
   * @returns {Promise<object>} 包含使用者名稱和 Email 的物件
   */
  async getProfile(userId) {
    const user = await userRepo.findOne({
      select: ["name", "email"],
      where: { id: userId },
    });

    if (!user) throw BadRequest("找不到該使用者");
    return user;
  },

  /**
   * @description 根據 ID 更新使用者個人資料
   * @param {string} userId - 使用者 ID
   * @param {object} userData - 要更新的使用者資料
   * @param {string} [userData.name] - 新的使用者名稱
   */
  async updateProfile(userId, userData) {
    const { name } = userData;

    const updateResult = await userRepo.update({ id: userId }, { name });

    if (updateResult.affected === 0) throw BadRequest("找不到該使用者");
  },

  /**
   * @description 取得使用者已購買的方案列表
   * @param {string} userId - 使用者 ID
   * @returns {Promise<Array<object>>} 包含使用者已購買的方案列表
   */
  async getCreditPackage(userId) {
    const creditPurchases = await creditPurchaseRepo.find({
      relations: {
        CreditPackage: true,
      },
      select: {
        purchased_credits: true,
        price_paid: true,
        purchaseAt: true,
        CreditPackage: {
          name: true,
        },
      },
      where: {
        user_id: userId,
      },
    });

    return creditPurchases.map((item) => ({
      purchased_credits: item.purchased_credits,
      price_paid: item.price_paid,
      name: item.CreditPackage?.name,
      purchase_at: item.purchaseAt,
    }));
  },

  /**
   * @description 取得使用者已預約的課程列表
   * @param {string} userId - 使用者 ID
   * @returns {Promise<object>} 包含堂數資訊與預約列表
   */
  async getCourses(userId) {
    // 取得使用者購買的總堂數
    const totalPurchasedCredits =
      (await creditPurchaseRepo.sum("purchased_credits", {
        user_id: userId,
      })) || 0;

    // 取得使用者已預約的課程列表
    const bookings = await courseBookingRepo.find({
      relations: {
        Course: {
          User: true, // 取得教練資訊
        },
      },
      where: {
        user_id: userId,
      },
      order: {
        bookingAt: "DESC",
      },
    });

    // 計算已使用的堂數 (僅統計未取消的課程)
    const usedCredits = bookings.filter((booking) => !booking.cancelledAt).length;

    // 預約列表
    const course_booking = bookings.map((booking) => ({
      name: booking.Course?.name,
      course_id: booking.course_id,
      coach_name: booking.Course?.User?.name,
      status: booking.status,
      start_at: booking.Course?.start_at,
      end_at: booking.Course?.end_at,
      meeting_url: booking.Course?.meeting_url,
      cancelled_at: booking.cancelledAt,
    }));

    return {
      credit_remain: totalPurchasedCredits - usedCredits,
      credit_usage: usedCredits,
      course_booking,
    };
  },
};

module.exports = userService;
