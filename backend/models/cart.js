"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      // define association here

      Cart.belongsTo(models.User, { foreignKey: "userId" });

      Cart.belongsToMany(models.Book, {
        through: models.CartItem,
        foreignKey: "cartId",
        otherKey: "bookId",
      });
      // Cart.hasMany(models.CartItem, { foreignKey: "cartId" });
    }
  }
  Cart.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "Cart",
    }
  );
  return Cart;
};
