"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // A User has many AccountDetails, associated by accountNumber
      this.hasMany(models.AccountDetail, {
        foreignKey: "accountNumber", // The field in AccountDetail that links to accountNumber in User
        sourceKey: "accountNumber", // The field in User that will be linked
        as: "accountDetails",
      });

      // One-to-one association with UserCredentials
      this.hasOne(models.UserCredentials, {
        foreignKey: "ApexAccountNumber", // Foreign key in UserCredentials
        sourceKey: "accountNumber", // The key in User that matches
        as: "userCredentials", // Alias for the association
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
