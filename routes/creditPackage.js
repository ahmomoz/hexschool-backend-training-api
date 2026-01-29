const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("CreditPackage");

router.get("/", async (req, res, next) => {
  const creditPackages = await dataSource.getRepository("CreditPackage").find();
  res.status(200).json({
    status: "success",
    message: "查詢成功",
    data: creditPackages,
  });
});

router.post("/", async (req, res, next) => {
  const creditPackageRepo = dataSource.getRepository("CreditPackage");
  const newSave = creditPackageRepo.create({
    name: req.body.name,
    credit_amount: req.body.credit_amount,
    price: req.body.price,
  });
  const result = await creditPackageRepo.save(newSave);
  res.status(200).json({
    status: "success",
    message: "新增成功",
    data: {
      id: result.id,
      name: result.name,
      credit_amount: result.credit_amount,
      price: result.price,
    },
  });
});

router.delete("/:creditPackageId", async (req, res, next) => {
  const creditPackageRepo = dataSource.getRepository("CreditPackage");
  await creditPackageRepo.delete({ id: req.params.creditPackageId });
  res.status(200).json({
    status: "success",
    message: "刪除成功",
    data: null,
  });
});

module.exports = router;
