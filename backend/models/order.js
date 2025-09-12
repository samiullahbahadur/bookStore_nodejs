"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, { foreignKey: "userId" });
      Order.belongsToMany(models.Book, {
        through: models.OrderItem,
        foreignKey: "orderId",
        otherKey: "bookId",
      });
      // Order.belongsToMany(models.Book, { through: models.OrderItem });
      Order.hasMany(models.OrderItem, { foreignKey: "orderId" });
    }
  }
  Order.init(
    {
      userId: DataTypes.INTEGER,
      totalPrice: DataTypes.FLOAT,

      status: {
        type: DataTypes.ENUM("pending", "shipped", "delivered", "canceled"),
        defaultValue: "pending",
      },
      shippingAddress: { type: DataTypes.STRING, allowNull: true },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "COD", // Cash on Delivery by default
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "unpaid", "paid"),
        allowNull: false,
        defaultValue: "pending",
      },
    },

    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
