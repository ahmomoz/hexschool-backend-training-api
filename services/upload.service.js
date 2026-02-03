const supabase = require("@/config/supabaseClient");

const { BadRequest } = require("@/errors");

const uploadService = {
  /**
   * @description 上傳圖片至 Supabase Storage
   * @param {object} file - 圖片檔案物件
   * @param {string} file.originalname - 原始檔案名稱
   * @param {string} file.mimetype - 檔案 MIME 類型
   * @param {Buffer} file.buffer - 檔案內容 Buffer
   * @param {number} file.size - 檔案大小 (bytes)
   * @returns {Promise<object>} 包含圖片公開網址的物件
   */
  async uploadImage(file) {
    if (!file) throw BadRequest("請上傳圖片");

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_FILE_TYPES = {
      "image/jpeg": true,
      "image/png": true,
    };

    if (file.size > MAX_FILE_SIZE) throw BadRequest("檔案大小超過 2MB");
    if (!ALLOWED_FILE_TYPES[file.mimetype])
      throw BadRequest("檔案格式錯誤，僅支援 jpg, jpeg, png");

    // 1. 產生唯一檔名 (避免重複)
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. 上傳至 Supabase Storage
    const { data, error } = await supabase.storage
      .from("images") // Bucket 名稱
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // 3. 取得圖片的公開網址
    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    return publicUrlData;
  },
};
module.exports = uploadService;
