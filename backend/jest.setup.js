process.env.NODE_ENV = "test";

import db from "./models/index.js";

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});
