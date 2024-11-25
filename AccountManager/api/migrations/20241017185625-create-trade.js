'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Trades', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      TradeName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Instrument: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      StopLoss: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      Profit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      UseBreakeven: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      BreakevenTrigger: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      BreakevenOffset: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      UseTrail: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      TrailTrigger: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      Trail: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      TradeTypeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ApexId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE, // Soft delete column
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Trades');
  },
};
