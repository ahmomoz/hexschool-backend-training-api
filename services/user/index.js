const config = require("@/config/index");
const generateJWT = require("@/utils/generateJWT");
const { dataSource } = require("@/db/data-source");
const { Conflict, BadRequest } = require("@/errors");
const { hashPassword, comparePassword } = require("@/utils/password");

const userRepo = dataSource.getRepository("User");

const userService = {
  async signup(userData) {
    const { name, email, password } = userData;

    // 檢查 Email 是否衝突
    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) throw Conflict("Email 已被使用");

    // 雜湊密碼
    const hashedPassword = await hashPassword(password);

    // 建立並存入資料庫
    const newSave = userRepo.create({
      name: name,
      email: email,
      password: hashedPassword,
      role: "USER",
    });
    const createdUser = await userRepo.save(newSave);

    return {
      id: createdUser.id,
      name: createdUser.name,
    };
  },

  async login(userData) {
    const { email, password } = userData;

    // 檢查 Email 是否存在
    const existingUser = await userRepo.findOneBy({ email });
    // 檢查密碼是否比對成功
    const isPasswordMatch = await comparePassword(
      password,
      existingUser.password,
    );
    if (!existingUser || !isPasswordMatch)
      throw BadRequest("使用者不存在或密碼輸入錯誤");

    // 產生 JWT Token
    const token = await generateJWT(
      {
        id: existingUser.id,
      },
      config.get("secret.jwtSecret"),
      {
        expiresIn: `${config.get("secret.jwtExpiresDay")}`,
      },
    );

    return {
      token,
      user: {
        name: existingUser.name,
      },
    };
  },

  async getProfile(userId) {
    return await userRepo.findOne({
      select: ["name", "email"],
      where: {
        id: userId,
      },
    });
  },

  async updateProfile(userId, userData) {
    const { name } = userData;
    await userRepo.update({ id: userId }, { name });
  },
};

module.exports = userService;
