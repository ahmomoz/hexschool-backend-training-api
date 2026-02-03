const uploadController = require("@/controllers/upload.controller");

const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("Upload");

const multer = require("multer");
const config = require("@/config/index");
const { dataSource } = require("@/db/data-source");

const isAuth = require("@/middlewares/auth.middleware")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

// 設定 Multer：將檔案暫存在記憶體中，不存入硬碟
const upload = multer({ storage: multer.memoryStorage() });

// 圖片上傳
// POST /api/upload
router.post("/", isAuth, upload.single("image"), uploadController.uploadImage);

module.exports = router;
