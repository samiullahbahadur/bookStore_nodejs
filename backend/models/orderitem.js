"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // define association here
      OrderItem.belongsTo(models.Order, { foreignKey: "orderId" });
      OrderItem.belongsTo(models.Book, { foreignKey: "bookId" });
    }
  }
  OrderItem.init(
    {
      orderId: DataTypes.INTEGER,
      bookId: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      price: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "OrderItem",
    }
  );
  return OrderItem;
};
