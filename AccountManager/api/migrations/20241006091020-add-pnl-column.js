"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("AccountDetails", "PnL", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true, // Adjust based on your requirements
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("AccountDetails", "PnL");
  },
};
