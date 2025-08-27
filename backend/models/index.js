import Sequelize from "sequelize";
import userModel from "./user.js";
import bookModel from "./book.js";
import cartModel from "./cart.js";
import cartitemtModel from "./cartitem.js";
import orderModel from "./order.js";
import orderitemtModel from "./orderitem.js";

import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PWD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
  }
);
const db = {};

db.User = userModel(sequelize, Sequelize.DataTypes);
db.Book = bookModel(sequelize, Sequelize.DataTypes);

db.Cart = cartModel(sequelize, Sequelize.DataTypes);
db.CartItem = cartitemtModel(sequelize, Sequelize.DataTypes);

db.Order = orderModel(sequelize, Sequelize.DataTypes);
db.OrderItem = orderitemtModel(sequelize, Sequelize.DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
