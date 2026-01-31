const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

/**
 * 雜湊密碼
 * @param {string} password - 明文密碼
 */
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

/**
 * 比對密碼
 * @param {string} password - 使用者輸入的明文
 * @param {string} hashedPassword - 資料庫存的雜湊值
 */
exports.comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};