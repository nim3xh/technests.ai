'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Trade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Trade.init({
    SL: DataTypes.INTEGER,
    TP: DataTypes.INTEGER,
    Instrument: DataTypes.STRING,
    Quantity: DataTypes.INTEGER,
    TrailingSL: DataTypes.INTEGER,
    Steps: DataTypes.INTEGER,
    BreakEven: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Trade',
  });
  return Trade;
};