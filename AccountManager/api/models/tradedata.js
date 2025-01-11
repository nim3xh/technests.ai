'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TradeData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TradeData.init({
    Direction: DataTypes.STRING,
    Quantity: DataTypes.INTEGER,
    Time: DataTypes.STRING,
    Stop_Loss: DataTypes.INTEGER,
    Profit: DataTypes.INTEGER,
    Use_Breakeven: DataTypes.BOOLEAN,
    Breakeven_Trigger: DataTypes.INTEGER,
    Breakeven_Offset: DataTypes.INTEGER,
    Use_Trail: DataTypes.BOOLEAN,
    Trail_Trigger: DataTypes.INTEGER,
    Trail: DataTypes.INTEGER,
    Instrument: DataTypes.STRING,
    Repeat: DataTypes.BOOLEAN,
    Repeat_Times: DataTypes.INTEGER,
    Repeat_Every: DataTypes.INTEGER,
    Account_Number: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TradeData',
  });
  return TradeData;
};