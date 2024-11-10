"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AccountDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // An AccountDetail belongs to a User, associated by account and accountNumber
      this.belongsTo(models.User, {
        foreignKey: "accountNumber", // The field in AccountDetail that links to accountNumber in User
        targetKey: "accountNumber", // The field in User that will be referenced
        as: "user",
      });
    }
  }
  AccountDetail.init(
    {
      account: DataTypes.STRING,
      accountBalance: DataTypes.DOUBLE,
      status: DataTypes.STRING,
      accountNumber: DataTypes.STRING,
      trailingThreshold: DataTypes.DOUBLE,
      PnL: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: "AccountDetail",
      paranoid: true,
    }
  );
  return AccountDetail;
};
