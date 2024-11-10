'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Trade extends Model {
    static associate(models) {
      // define associations here
    }
  }
  
  Trade.init({
    TradeName: DataTypes.STRING,
    Instrument: DataTypes.STRING,
    Quantity: DataTypes.INTEGER,
    StopLoss: DataTypes.INTEGER,
    Profit: DataTypes.INTEGER,
    UseBreakeven: DataTypes.BOOLEAN,
    BreakevenTrigger: DataTypes.INTEGER,
    BreakevenOffset: DataTypes.INTEGER,
    UseTrail: DataTypes.BOOLEAN,
    TrailTrigger: DataTypes.INTEGER,
    Trail: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Trade',
  });

  return Trade;
};
