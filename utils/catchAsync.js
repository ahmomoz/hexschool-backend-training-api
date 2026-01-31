/**
 * 捕捉異步函數 (Async Function) 錯誤的高階函數
 * @param {Function} fn - 原本的異步 Controller 函數
 * @returns {Function} - 返回一個符合 Express 簽名的中間件
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // 執行傳入的異步函數，並利用 Promise.catch 捕捉錯誤
    // 一旦出錯，會自動呼叫 next(err)，將錯誤傳遞給 Global Error Handler
    fn(req, res, next).catch(next);
  };
};

module.exports = { catchAsync };
