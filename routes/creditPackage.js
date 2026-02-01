const express = require("express");
const router = express.Router();
const config = require("@/config/index");
const logger = require("@/utils/logger")("CreditPackage");
const { z } = require("zod");
const { dataSource } = require("@/db/data-source");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");
const { Conflict, BadRequest } = require("@/errors");
const { validate, validateId } = require("@/middlewares/validate.middleware");

const isAuth = require("@/middlewares/auth.middleware")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

const createCreditPackageSchema = z.object({
  name: z.string().min(1, "方案名稱為必填"),
  credit_amount: z.coerce.number().min(1, "課堂數量為必填"),
  price: z.coerce.number().min(1, "價格為必填"),
});

// 取得購買方案列表
// GET /api/credit-package
router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const creditPackages = await dataSource
      .getRepository("CreditPackage")
      .find();

    const creditPackageList = creditPackages.map((creditPackage) => ({
      id: creditPackage.id,
      name: creditPackage.name,
      credit_amount: creditPackage.credit_amount,
      price: creditPackage.price,
    }));

    sendSuccess(res, { data: creditPackageList, message: "查詢成功" });
  }),
);

// 新增購買方案
// POST /api/credit-package
router.post(
  "/",
  validate(createCreditPackageSchema),
  catchAsync(async (req, res, next) => {
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const { name } = req.body;

    const existingCreditPackage = await creditPackageRepo.findOneBy({ name });
    if (existingCreditPackage) {
      return next(Conflict("資料重複"));
    }

    const newSave = creditPackageRepo.create({
      name: req.body.name,
      credit_amount: req.body.credit_amount,
      price: req.body.price,
    });

    const createdCreditPackage = await creditPackageRepo.save(newSave);
    const creditPackageResponse = await creditPackageRepo.findOneBy({
      id: createdCreditPackage.id,
    });

    sendSuccess(res, {
      data: creditPackageResponse,
      message: "新增成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
);

// 刪除購買方案
// DELETE /api/credit-package/:creditPackageId
router.delete(
  "/:creditPackageId",
  validateId("creditPackageId"),
  catchAsync(async (req, res, next) => {
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const { creditPackageId } = req.params;

    const existingCreditPackage = await creditPackageRepo.findOneBy({
      id: creditPackageId,
    });
    if (!existingCreditPackage) {
      return next(BadRequest("找不到此方案"));
    }

    await creditPackageRepo.delete({ id: creditPackageId });

    sendSuccess(res, { message: "刪除成功" });
  }),
);

// 使用者購買方案
// POST /api/credit-package/:creditPackageId
router.post(
  "/:creditPackageId",
  validateId("creditPackageId"),
  isAuth,
  catchAsync(async (req, res, next) => {
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");

    const { id } = req.user;
    const { creditPackageId } = req.params;

    const creditPackage = await creditPackageRepo.findOne({
      where: {
        id: creditPackageId,
      },
      select: {
        credit_amount: true,
        price: true,
      },
    });
    if (!creditPackage) {
      return next(BadRequest("找不到此方案"));
    }

    const newPurchase = creditPurchaseRepo.create({
      user_id: id,
      credit_package_id: creditPackageId,
      purchased_credits: creditPackage.credit_amount,
      price_paid: creditPackage.price,
      purchaseAt: new Date().toISOString(),
    });

    await creditPurchaseRepo.save(newPurchase);

    sendSuccess(res, {
      message: "購買成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
);

module.exports = router;
