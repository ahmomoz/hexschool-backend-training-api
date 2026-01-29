const express = require("express");

const router = express.Router();
const { dataSource } = require("../../../db/data-source");
const logger = require("../../../utils/logger")("Skill");

router.get("/", async (req, res, next) => {
  const skills = await dataSource.getRepository("Skill").find();
  res.status(200).json({
    status: "success",
    message: "查詢成功",
    data: skills,
  });
});

router.post("/", async (req, res, next) => {
  const skillRepo = dataSource.getRepository("Skill");
  const newSave = skillRepo.create({
    name: req.body.name,
  });
  const result = await skillRepo.save(newSave);
  res.status(200).json({
    status: "success",
    message: "新增成功",
    data: {
      id: result.id,
      name: result.name,
    },
  });
});

router.delete("/:skillId", async (req, res, next) => {
  const skillRepo = dataSource.getRepository("Skill");
  await skillRepo.delete({ id: req.params.skillId });
  res.status(200).json({
    status: "success",
    message: "刪除成功",
    data: null,
  });
});

module.exports = router;
