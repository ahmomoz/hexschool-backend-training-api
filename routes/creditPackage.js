const express = require("express");
const router = express.Router();
const logger = require("@/utils/logger")("CreditPackage");
const { z } = require("zod");
const { dataSource } = require("@/db/data-source");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");
const { Conflict, NotFound } = require("@/errors");
const { validate } = require("@/middlewares/validate.middleware");

const createCreditPackageSchema = z.object({
  name: z.string().min(1, "方案名稱為必填"),
  credit_amount: z.coerce.number().min(1, "課堂數量為必填"),
  price: z.coerce.number().min(1, "價格為必填"),
});

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const creditPackages = await dataSource
      .getRepository("CreditPackage")
      .find();
    sendSuccess(res, { data: creditPackages, message: "查詢成功" });
  }),
);

router.post(
  "/",
  validate(createCreditPackageSchema),
  catchAsync(async (req, res, next) => {
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const { name } = req.body;

    const existingCreditPackage = await creditPackageRepo.findOne({
      select: ["name"],
      where: {
        name,
      },
    });

    if (existingCreditPackage) {
      return next(Conflict("資料重複"));
    }

    const newSave = creditPackageRepo.create({
      name: req.body.name,
      credit_amount: req.body.credit_amount,
      price: req.body.price,
    });

    const createdCreditPackage = await creditPackageRepo.save(newSave);

    sendSuccess(res, {
      data: createdCreditPackage,
      message: "新增成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
);

router.delete(
  "/:creditPackageId",
  validate(z.object({ creditPackageId: z.string().uuid() }), "params"),
  catchAsync(async (req, res, next) => {
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const { creditPackageId } = req.params;

    const existingCreditPackage = await creditPackageRepo.findOne({
      select: ["id"],
      where: {
        id: creditPackageId,
      },
    });

    if (!existingCreditPackage) {
      return next(NotFound("找不到此方案"));
    }

    await creditPackageRepo.delete({ id: creditPackageId });

    sendSuccess(res, { message: "刪除成功" });
  }),
);

module.exports = router;
