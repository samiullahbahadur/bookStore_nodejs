import bcrypt from "bcrypt";

export default {
  up: async (queryInterface, Sequelize) => {
    // Delete ALL existing users
    await queryInterface.bulkDelete("Users", null, {});

    // Hash password
    const hashedPassword = await bcrypt.hash("admin@123", 10);

    // Insert a single clean admin
    return queryInterface.bulkInsert("Users", [
      {
        name: "Super Admin",
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback = remove this admin
    return queryInterface.bulkDelete(
      "Users",
      { email: "admin@example.com" },
      {}
    );
  },
};
