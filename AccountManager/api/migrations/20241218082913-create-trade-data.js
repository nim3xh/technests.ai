'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TradeData', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Direction: {
        type: Sequelize.STRING
      },
      Quantity: {
        type: Sequelize.INTEGER
      },
      Time: {
        type: Sequelize.STRING
      },
      Stop_Loss: {
        type: Sequelize.INTEGER
      },
      Profit: {
        type: Sequelize.INTEGER
      },
      Use_Breakeven: {
        type: Sequelize.BOOLEAN
      },
      Breakeven_Trigger: {
        type: Sequelize.INTEGER
      },
      Breakeven_Offset: {
        type: Sequelize.INTEGER
      },
      Use_Trail: {
        type: Sequelize.BOOLEAN
      },
      Trail_Trigger: {
        type: Sequelize.INTEGER
      },
      Trail: {
        type: Sequelize.INTEGER
      },
      Instrument: {
        type: Sequelize.STRING
      },
      Account_Number: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TradeData');
  }
};