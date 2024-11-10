'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserCredentials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING
      },
      FirstName: {
        type: Sequelize.STRING
      },
      LastName: {
        type: Sequelize.STRING
      },
      ApexAccountNumber: {
        type: Sequelize.STRING
      },
      AddressLine1: {
        type: Sequelize.STRING
      },
      AddressLine2: {
        type: Sequelize.STRING
      },
      City: {
        type: Sequelize.STRING
      },
      State: {
        type: Sequelize.STRING
      },
      Country: {
        type: Sequelize.STRING
      },
      ZipCode: {
        type: Sequelize.STRING
      },
      PhoneNumber: {
        type: Sequelize.STRING
      },
      GmailID: {
        type: Sequelize.STRING
      },
      GmailPW: {
        type: Sequelize.STRING
      },
      NinjaUsername: {
        type: Sequelize.STRING
      },
      NinjaPW: {
        type: Sequelize.STRING
      },
      ApexID: {
        type: Sequelize.STRING
      },
      ApexPW: {
        type: Sequelize.STRING
      },
      RithmicID: {
        type: Sequelize.STRING
      },
      RithmicPW: {
        type: Sequelize.STRING
      },
      VPSIP: {
        type: Sequelize.STRING
      },
      VPSUsername: {
        type: Sequelize.STRING
      },
      VPSPW: {
        type: Sequelize.STRING
      },
      ReferCode: {
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
    await queryInterface.dropTable('UserCredentials');
  }
};
