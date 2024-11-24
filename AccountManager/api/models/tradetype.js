'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TradeType extends Model {
    static associate(models) {
      // Define association: A TradeType can have many Trades
      TradeType.hasMany(models.Trade, {
        foreignKey: 'TradeTypeId',
        as: 'Trades',
      });
    }
  }

  TradeType.init(
    {
      TypeName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'TradeType',
      timestamps: true,
    }
  );

  return TradeType;
};
