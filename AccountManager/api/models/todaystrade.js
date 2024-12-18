'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TodaysTrade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TodaysTrade.init({
    Date: DataTypes.DATE,
    Time: DataTypes.STRING,
    Direction: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TodaysTrade',
  });
  return TodaysTrade;
};