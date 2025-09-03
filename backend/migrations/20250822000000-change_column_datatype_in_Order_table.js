"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Orders", "status", {
      type: Sequelize.DataTypes.ENUM(
        "pending",
        "shipped",
        "delivered",
        "canceled"
      ),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Orders", "status", {
      type: Sequelize.INTEGER,
    });
  },
};
