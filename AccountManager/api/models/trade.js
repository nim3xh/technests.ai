'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Trade extends Model {
    static associate(models) {
      // Define association: A Trade belongs to a TradeType
      Trade.belongsTo(models.TradeType, {
        foreignKey: 'TradeTypeId',
        as: 'TradeType',
      });
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
      TradeTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'TradeTypes', // Matches the table name
          key: 'id',
        },
      },
      Repeat: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      RepeatTimes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      RepeatEvery: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ApexId:{
        type: DataTypes.INTEGER,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: 'Trade',
      tableName: 'Trades', // Explicitly set table name
      paranoid: true, // Enable soft deletes
      timestamps: true,
      deletedAt: 'deletedAt',
    }
  );

  return Trade;
};
