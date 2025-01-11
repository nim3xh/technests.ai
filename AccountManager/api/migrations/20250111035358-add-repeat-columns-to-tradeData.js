'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adding new columns to the Trades table
    await queryInterface.addColumn('TradeData', 'Repeat', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('TradeData', 'Repeat_Times', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('TradeData', 'Repeat_Every', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Removing the added columns in case of rollback
    await queryInterface.removeColumn('TradeData', 'Repeat');
    await queryInterface.removeColumn('TradeData', 'Repeat_Times');
    await queryInterface.removeColumn('TradeData', 'Repeat_Every');
  },
};
