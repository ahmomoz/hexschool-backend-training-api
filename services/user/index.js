const config = require("@/config/index");
const generateJWT = require("@/utils/generateJWT");

const { dataSource } = require("@/db/data-source");
const { Conflict, BadRequest } = require("@/errors");
const { hashPassword, comparePassword } = require("@/utils/password");

const userRepo = dataSource.getRepository("User");

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
};

module.exports = userService;
