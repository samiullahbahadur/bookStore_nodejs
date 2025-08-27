"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.belongsTo(models.User, {
        constraints: true,
        onDelete: "CASCADE",
        foreignKey: "userId",
      });
      Book.belongsToMany(models.Cart, {
        through: models.CartItem,
        foreignKey: "bookId",
        otherKey: "cartId",
      });

      // Book.hasMany(models.CartItem, { foreignKey: "bookId" });
      Book.hasMany(models.OrderItem, { foreignKey: "bookId" });

      Book.belongsToMany(models.Order, {
        through: models.OrderItem,
        foreignKey: "bookId",
        otherKey: "orderId",
      });
    }
  }
  Book.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.FLOAT,
      photo: DataTypes.STRING,
      author: DataTypes.STRING,
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Book",
    }
  );
  return Book;
};
