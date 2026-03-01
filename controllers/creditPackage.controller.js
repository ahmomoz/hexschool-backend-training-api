const creditPackageService = require("@/services/creditPackage.service");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");

const creditPackageController = {
  getCreditPackages: catchAsync(async (req, res, next) => {
    const creditPackageList = await creditPackageService.getCreditPackages();

    sendSuccess(res, { data: creditPackageList, message: "查詢成功" });
  }),

  createCreditPackage: catchAsync(async (req, res, next) => {
    const creditPackageData = req.body;
    const creditPackageResponse =
      await creditPackageService.createCreditPackage(creditPackageData);

    sendSuccess(res, {
      data: creditPackageResponse,
      message: "新增成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),

  deleteCreditPackage: catchAsync(async (req, res, next) => {
    const { creditPackageId } = req.params;
    await creditPackageService.deleteCreditPackage(creditPackageId);

    sendSuccess(res, { message: "刪除成功" });
  }),

  purchaseCreditPackage: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { creditPackageId } = req.params;

    await creditPackageService.purchaseCreditPackage(id, creditPackageId);

    sendSuccess(res, {
      message: "購買成功",
      statusCode: HTTP_STATUS.CREATED,
    });
  }),
};

module.exports = creditPackageController;
