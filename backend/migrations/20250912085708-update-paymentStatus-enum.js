// export default {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.changeColumn("Orders", "paymentStatus", {
//       type: Sequelize.ENUM("pending", "unpaid", "paid"),
//       allowNull: false,
//       defaultValue: "pending",
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     // rollback to simple string if needed
//     await queryInterface.changeColumn("Orders", "paymentStatus", {
//       type: Sequelize.STRING,
//       allowNull: false,
//       defaultValue: "pending",
//     });
//   },
// };

export default {
  async up(queryInterface, Sequelize) {
    // 1. Create ENUM type
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Orders_paymentStatus') THEN
          CREATE TYPE "enum_Orders_paymentStatus" AS ENUM ('pending', 'unpaid', 'paid');
        END IF;
      END$$;
    `);

    // 2. Alter column to use ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE "Orders"
      ALTER COLUMN "paymentStatus" DROP DEFAULT,
      ALTER COLUMN "paymentStatus" TYPE "enum_Orders_paymentStatus" USING ("paymentStatus"::text::"enum_Orders_paymentStatus"),
      ALTER COLUMN "paymentStatus" SET DEFAULT 'pending';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Rollback: turn column back into plain string
    await queryInterface.sequelize.query(`
      ALTER TABLE "Orders"
      ALTER COLUMN "paymentStatus" DROP DEFAULT,
      ALTER COLUMN "paymentStatus" TYPE VARCHAR(255),
      ALTER COLUMN "paymentStatus" SET DEFAULT 'pending';
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_Orders_paymentStatus";
    `);
  },
};
