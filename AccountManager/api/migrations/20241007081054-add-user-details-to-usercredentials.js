"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("UserCredentials", "FirstName", {
      type: Sequelize.STRING,
      allowNull: true, // or false, based on your requirements
    });
    await queryInterface.addColumn("UserCredentials", "LastName", {
      type: Sequelize.STRING,
      allowNull: true, // or false, based on your requirements
    });
    await queryInterface.addColumn("UserCredentials", "ApexAccountNumber", {
      type: Sequelize.STRING,
      allowNull: true, // or false, based on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("UserCredentials", "FirstName");
    await queryInterface.removeColumn("UserCredentials", "LastName");
    await queryInterface.removeColumn("UserCredentials", "ApexAccountNumber");
  },
};
