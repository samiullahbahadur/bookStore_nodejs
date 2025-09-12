export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Orders", "paymentStatus", {
      type: Sequelize.ENUM("pending", "unpaid", "paid"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    // rollback to simple string if needed
    await queryInterface.changeColumn("Orders", "paymentStatus", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "pending",
    });
  },
};
