const creditPackageController = require("@/controllers/creditPackage.controller");

const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("CreditPackage");

const config = require("@/config/index");
const { dataSource } = require("@/db/data-source");
const { validate } = require("@/middlewares/validate.middleware");

const isAuth = require("@/middlewares/auth.middleware")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

const {
  createCreditPackageSchema,
  createCreditIdSchema,
} = require("@/validations/creditPackage.schema");

// 取得購買方案列表
// GET /api/credit-package
router.get("/", creditPackageController.getCreditPackages);

// 新增購買方案
// POST /api/credit-package
router.post(
  "/",
  validate(createCreditPackageSchema),
  creditPackageController.createCreditPackage,
);

// 刪除購買方案
// DELETE /api/credit-package/:creditPackageId
router.delete(
  "/:creditPackageId",
  validate(createCreditIdSchema, "params"),
  creditPackageController.deleteCreditPackage,
);

// 使用者購買方案
// POST /api/credit-package/:creditPackageId
router.post(
  "/:creditPackageId",
  validate(createCreditIdSchema, "params"),
  isAuth,
  creditPackageController.purchaseCreditPackage,
);

module.exports = router;
