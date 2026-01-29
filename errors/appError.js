/**
 * 應用程式自定義錯誤類別
 * 用於統一處理 API 錯誤回應
 * @extends Error
 */
class AppError extends Error {
  /**
   * 建立一個 AppError 實例
   * @param {object} params - 錯誤參數物件
   * @param {string} params.message - 錯誤訊息
   * @param {number} params.statusCode - HTTP 狀態碼
   * @param {boolean} [params.isOperational=true] - 是否為可預期的操作錯誤 (預設為 true)
   * @param {any} [params.data=null] - 錯誤詳細資訊 (預設為 null)
   */
  constructor({ message, statusCode, isOperational = true, data = null }) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };