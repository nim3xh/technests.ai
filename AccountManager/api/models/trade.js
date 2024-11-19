'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Trade extends Model {
    static associate(models) {
      // define associations here
    }
  }

  Trade.init(
    {
      TradeName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Instrument: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      StopLoss: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Profit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UseBreakeven: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      BreakevenTrigger: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      BreakevenOffset: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      UseTrail: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      TrailTrigger: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Trail: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      TradeType: {
        type: DataTypes.STRING,
        allowNull: true, // You can set this to true if it's optional
      },
    },
    {
      sequelize,
      modelName: 'Trade',
      paranoid: true, // Enables soft delete
      timestamps: true, // Adds `createdAt` and `updatedAt` fields
      deletedAt: 'deletedAt', // Adds `deletedAt` field for soft delete
    }
  );

  return Trade;
};
