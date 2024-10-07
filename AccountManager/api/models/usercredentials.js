"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserCredentials extends Model {
    static associate(models) {
      // One-to-one association with User
      this.belongsTo(models.User, {
        foreignKey: "ApexAccountNumber", // Foreign key in UserCredentials
        targetKey: "accountNumber", // The key in User that matches
        as: "userAccount", // Alias for the association
      });
    }
  }
  UserCredentials.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      FirstName: DataTypes.STRING,
      LastName: DataTypes.STRING,
      ApexAccountNumber: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserCredentials",
    }
  );
  return UserCredentials;
};
