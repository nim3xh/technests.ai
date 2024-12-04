'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Results', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ResultTime: {
        type: Sequelize.DATE
      },
      FileName: {
        type: Sequelize.STRING
      },
      TradeCount: {
        type: Sequelize.INTEGER
      },
      Account: {
        type: Sequelize.STRING
      },
      Instrument: {
        type: Sequelize.STRING
      },
      Quantity: {
        type: Sequelize.INTEGER
      },
      Profit: {
        type: Sequelize.FLOAT
      },
      StopLoss: {
        type: Sequelize.FLOAT
      },
      TradeTime: {
        type: Sequelize.TIME
      },
      Direction: {
        type: Sequelize.STRING
      },
      EntryTime: {
        type: Sequelize.DATE
      },
      EntryPrice: {
        type: Sequelize.FLOAT
      },
      ExitTime: {
        type: Sequelize.DATE
      },
      ExitPrice: {
        type: Sequelize.FLOAT
      },
      Result: {
        type: Sequelize.STRING
      },
      Comment: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true, // Soft delete column
        type: Sequelize.DATE,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Results');
  }
};