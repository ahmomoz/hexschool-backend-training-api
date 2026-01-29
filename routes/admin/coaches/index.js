const express = require("express");

const router = express.Router();
const { dataSource } = require("../../../db/data-source");
const logger = require("../../../utils/logger")("Coach");

// 將使用者新增為教練
router.post("/:userId", async (req, res, next) => {
  const { userId } = req.params;

  const {
    experience_years: experienceYears,
    description,
    profile_image_url: profileImageUrl = null,
  } = req.body;

  const userRepo = dataSource.getRepository("User");
  const existingUser = await userRepo.findOne({
    select: ["id", "name", "role"],
    where: {
      id: userId,
    },
  });

  const coachRepo = dataSource.getRepository("Coach");
  const newCoach = coachRepo.create({
    user_id: userId,
    experience_years: experienceYears,
    description,
    profile_image_url: profileImageUrl,
  });

  await userRepo.update(
    {
      id: userId,
      role: "USER",
    },
    {
      role: "COACH",
    },
  );

  const savedCoach = await coachRepo.save(newCoach);
  const savedUser = await userRepo.findOne({
    select: ["name", "role"],
    where: { id: userId },
  });

  res.status(201).json({
    status: "success",
    message: "新增成功",
    data: {
      user: savedUser,
      coach: savedCoach,
    },
  });
});

module.exports = router;
