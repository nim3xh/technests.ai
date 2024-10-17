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
      SL: {
        type: Sequelize.INTEGER
      },
      TP: {
        type: Sequelize.INTEGER
      },
      Instrument: {
        type: Sequelize.STRING
      },
      Quantity: {
        type: Sequelize.INTEGER
      },
      TrailingSL: {
        type: Sequelize.INTEGER
      },
      Steps: {
        type: Sequelize.INTEGER
      },
      BreakEven: {
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