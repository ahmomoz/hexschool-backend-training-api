const jwt = require("jsonwebtoken");

/**
 * 產生 JSON Web Token
 * @param {Object} payload Token 內攜帶的資料
 * @param {String} secret 簽署 Token 的密鑰
 * @param {Object} [option] 其他選項 (參考 jsonwebtoken 套件)
 * @returns {Promise<String>}
 */
module.exports = (payload, secret, option = {}) =>
  new Promise((resolve, reject) => {
    jwt.sign(payload, secret, option, (err, token) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(token);
    });
  });
