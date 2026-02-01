const express = require("express");
const router = express.Router();
const config = require("@/config/index");
const logger = require("@/utils/logger")("CreditPackage");
const multer = require("multer");
const supabase = require("@/config/supabaseClient");

const { dataSource } = require("@/db/data-source");
const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");
const { BadRequest } = require("@/errors");

const isAuth = require("@/middlewares/auth.middleware")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

// 設定 Multer：將檔案暫存在記憶體中，不存入硬碟
const upload = multer({ storage: multer.memoryStorage() });

// 圖片上傳
// POST /api/upload
router.post(
  "/",
  isAuth,
  upload.single("image"),
  catchAsync(async (req, res, next) => {
    const file = req.file;

    if (!file) {
      return next(BadRequest("請上傳圖片"));
    }

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_FILE_TYPES = {
      "image/jpeg": true,
      "image/png": true,
    };

    if (file.size > MAX_FILE_SIZE) {
      return next(BadRequest("檔案大小超過 2MB"));
    }
    if (!ALLOWED_FILE_TYPES[file.mimetype]) {
      return next(BadRequest("檔案格式錯誤，僅支援 jpg, jpeg, png"));
    }

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

    sendSuccess(res, {
      data: {
        image_url: publicUrlData.publicUrl,
      },
      message: "上傳成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
);

module.exports = router;
