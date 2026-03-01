const { dataSource } = require("@/db/data-source");
const { Conflict, BadRequest } = require("@/errors");

const creditPackageRepo = dataSource.getRepository("CreditPackage");
const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");

const creditPackageService = {
  /**
   * @description 取得所有儲值方案
   * @returns {Promise<Array<object>>} 儲值方案列表
   */
  async getCreditPackages() {
    const creditPackages = await creditPackageRepo.find();

    return creditPackages.map((creditPackage) => ({
      id: creditPackage.id,
      name: creditPackage.name,
      credit_amount: creditPackage.credit_amount,
      price: creditPackage.price,
    }));
  },

  /**
   * @description 建立新的儲值方案
   * @param {object} creditPackage - 儲值方案資料
   * @param {string} creditPackage.name - 方案名稱
   * @param {number} creditPackage.credit_amount - 課堂數量
   * @param {number} creditPackage.price - 價格
   * @returns {Promise<object>} 新建立的儲值方案
   */
  async createCreditPackage(creditPackage) {
    const { name } = creditPackage;

    const existingCreditPackage = await creditPackageRepo.findOneBy({ name });
    if (existingCreditPackage) throw Conflict("資料重複");

    const newSave = creditPackageRepo.create({
      ...creditPackage,
    });

    const createdCreditPackage = await creditPackageRepo.save(newSave);
    return await creditPackageRepo.findOneBy({
      id: createdCreditPackage.id,
    });
  },

  /**
   * @description 刪除儲值方案
   * @param {string} creditPackageId - 儲值方案 ID
   * @returns {Promise<void>}
   */
  async deleteCreditPackage(creditPackageId) {
    const existingCreditPackage = await creditPackageRepo.findOneBy({
      id: creditPackageId,
    });
    if (!existingCreditPackage) throw BadRequest("找不到此方案");

    await creditPackageRepo.delete({ id: creditPackageId });
  },

  /**
   * @description 使用者購買方案
   * @param {string} userId - 使用者 ID
   * @param {string} creditPackageId - 購買方案 ID
   * @returns {Promise<void>}
   */
  async purchaseCreditPackage(userId, creditPackageId) {
    const creditPackage = await creditPackageRepo.findOne({
      where: {
        id: creditPackageId,
      },
      select: {
        credit_amount: true,
        price: true,
      },
    });
    if (!creditPackage) throw BadRequest("找不到此方案");

    const newPurchase = creditPurchaseRepo.create({
      user_id: userId,
      credit_package_id: creditPackageId,
      purchased_credits: creditPackage.credit_amount,
      price_paid: creditPackage.price,
      purchaseAt: new Date().toISOString(),
    });

    await creditPurchaseRepo.save(newPurchase);
  },
};
module.exports = creditPackageService;
