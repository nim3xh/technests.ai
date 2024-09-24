"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // A User has many AccountDetails, associated by accountNumber
      this.hasMany(models.AccountDetail, {
        foreignKey: "accountNumber", // The field in AccountDetail that links to accountNumber in User
        sourceKey: "accountNumber", // The field in User that will be linked
        as: "accountDetails",
      });
    }
  }
  User.init(
    {
      accountNumber: DataTypes.STRING,
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
