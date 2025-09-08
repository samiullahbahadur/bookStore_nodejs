import { Sequelize } from "sequelize";
import dotenv from "dotenv";

import userModel from "./user.js";
import bookModel from "./book.js";
import cartModel from "./cart.js";
import cartitemtModel from "./cartitem.js";
import orderModel from "./order.js";
import orderitemtModel from "./orderitem.js";

dotenv.config();

// Decide which DB to connect based on environment
const isTest = process.env.NODE_ENV === "test";
const dbName = isTest ? process.env.DB_NAME_TEST : process.env.DB_NAME;

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PWD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false, // disable SQL logs in console (cleaner for tests)
  }
);

const db = {};

// Initialize models
db.User = userModel(sequelize, Sequelize.DataTypes);
db.Book = bookModel(sequelize, Sequelize.DataTypes);
db.Cart = cartModel(sequelize, Sequelize.DataTypes);
db.CartItem = cartitemtModel(sequelize, Sequelize.DataTypes);
db.Order = orderModel(sequelize, Sequelize.DataTypes);
db.OrderItem = orderitemtModel(sequelize, Sequelize.DataTypes);

// Run associations if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
