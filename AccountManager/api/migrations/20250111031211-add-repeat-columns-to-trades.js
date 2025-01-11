'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adding new columns to the Trades table
    await queryInterface.addColumn('Trades', 'Repeat', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Trades', 'RepeatTimes', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('Trades', 'RepeatEvery', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Removing the added columns in case of rollback
    await queryInterface.removeColumn('Trades', 'Repeat');
    await queryInterface.removeColumn('Trades', 'RepeatTimes');
    await queryInterface.removeColumn('Trades', 'RepeatEvery');
  },
};
