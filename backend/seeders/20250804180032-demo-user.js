import bcrypt from "bcrypt";

export default {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("admin", 10);

    return queryInterface.bulkInsert("Users", [
      {
        name: "Ahmad",
        username: "Ahmadi",
        email: "ahmad@gmail.com",
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", { email: "ahmad@gmail.com" });
  },
};
