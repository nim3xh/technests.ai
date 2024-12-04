'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Result extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Result.init({
    ResultTime: DataTypes.DATE,
    FileName: DataTypes.STRING,
    TradeCount: DataTypes.INTEGER,
    Account: DataTypes.STRING,
    Instrument: DataTypes.STRING,
    Quantity: DataTypes.INTEGER,
    Profit: DataTypes.FLOAT,
    StopLoss: DataTypes.FLOAT,
    TradeTime: DataTypes.TIME,
    Direction: DataTypes.STRING,
    EntryTime: DataTypes.DATE,
    EntryPrice: DataTypes.FLOAT,
    ExitTime: DataTypes.DATE,
    ExitPrice: DataTypes.FLOAT,
    Result: DataTypes.STRING,
    Comment: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Result',
    paranoid: true, // Enable soft deletes
    timestamps: true,
  });
  return Result;
};