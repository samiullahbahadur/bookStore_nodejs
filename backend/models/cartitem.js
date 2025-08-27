"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      // define association here
      CartItem.belongsTo(models.Cart, { foreignKey: "cartId" });
      CartItem.belongsTo(models.Book, { foreignKey: "bookId" });
    }
  }
  CartItem.init(
    {
      id: {
        // ← add this
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cartId: { type: DataTypes.INTEGER },
      bookId: { type: DataTypes.INTEGER },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "CartItem",
    }
  );
  return CartItem;
};
