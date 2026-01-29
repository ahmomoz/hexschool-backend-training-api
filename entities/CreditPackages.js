const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CreditPackage",
  tableName: "CREDIT_PACKAGE",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false,
      unique: true,
    },
    credit_amount: {
      type: "integer",
      nullable: false,
    },
    price: {
      type: "numeric", // 處理需要極高精確度的數字
      precision: 10, // 總共可以存 10 個數字
      scale: 2, // 固定保留 2 位小數
      nullable: false,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
  },
});
