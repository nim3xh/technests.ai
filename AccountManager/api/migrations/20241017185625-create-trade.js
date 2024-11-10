'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Trades', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      TradeName: {
        type: Sequelize.STRING
      },
      Instrument: {
        type: Sequelize.STRING
      },
      Quantity: {
        type: Sequelize.INTEGER
      },
      StopLoss: {
        type: Sequelize.INTEGER
      },
      Profit: {
        type: Sequelize.INTEGER
      },
      UseBreakeven: {
        type: Sequelize.BOOLEAN
      },
      BreakevenTrigger: {
        type: Sequelize.INTEGER
      },
      BreakevenOffset: {
        type: Sequelize.INTEGER
      },
      UseTrail: {
        type: Sequelize.BOOLEAN
      },
      TrailTrigger: {
        type: Sequelize.INTEGER
      },
      Trail: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Trades');
  }
};
