const express = require("express");

const router = express.Router();
const { dataSource } = require("../../db/data-source");
const logger = require("../../utils/logger")("User");

// 使用者註冊
router.post("/signup", async (req, res, next) => {
  const userRepo = dataSource.getRepository("User");
  const { name, email, password } = req.body;
  const newSave = userRepo.create({
    name: name,
    email: email,
    password: password,
    role: "USER",
  });
  const result = await userRepo.save(newSave);
  res.status(200).json({
    status: "success",
    message: "註冊成功",
    data: {
      user:{
        id: result.id,
        name: result
      }
    },
  });
});

module.exports = router;
