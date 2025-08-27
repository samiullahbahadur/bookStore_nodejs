import { Op } from "sequelize";
import db from "../models/index.js";

const { sequelize, User, Cart, CartItem, Book, Order, OrderItem } = db;

export const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, paymentMethod } = req.body;

  try {
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: Book,
          through: { attributes: ["quantity"] },
        },
      ],
    });
    if (!cart || cart.Books.length === 0) {
      return res.status(400).json({ message: "Cart is empy" });
    }
    let totalPrice = 0;
    cart.Books.forEach((book) => {
      totalPrice += book.price * book.CartItem.quantity;
    });

    // Create order
    const order = await Order.create({
      userId,
      totalPrice,
      status: "pending",
      shippingAddress: JSON.stringify(req.body.shippingAddress || ""),
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "unpaid",
    });

    // Create order items
    const newOrderItems = cart.Books.map((book) => ({
      orderId: order.id,
      bookId: book.id,
      quantity: book.CartItem.quantity,
      price: book.price,
    }));

    await OrderItem.bulkCreate(newOrderItems);

    // Clear cart
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.status(201).json({
      message: "Order created successfully",
      orderId: order.id,
      totalPrice,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      items: newOrderItems,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res
      .status(500)
      .json({ message: "Server error form backend", error: error.message });
  }
};

// Get Orders
export const getOrder = async (req, res) => {
  try {
    let orders;

    if (req.user.isAdmin) {
      // 🔹 Admin: get ALL orders (including canceled)
      orders = await Order.findAll({
        include: [
          {
            model: Book,
            through: { model: OrderItem, attributes: ["quantity", "price"] },
          },
          { model: User, attributes: ["id", "name"] },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else {
      // 🔹 Normal user: get ALL their orders (including canceled)
      orders = await Order.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Book,
            through: { model: OrderItem, attributes: ["quantity", "price"] },
          },
          { model: User, attributes: ["id", "name"] },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    // 🔹 Format response
    const formattedOrders = orders.map((order) => {
      let shippingAddress = null;
      try {
        shippingAddress = order.shippingAddress
          ? JSON.parse(order.shippingAddress)
          : null;
      } catch (err) {
        shippingAddress = order.shippingAddress; // fallback if already string
      }

      return {
        orderId: order.id,
        status: order.status,
        user: order.User ? { id: order.User.id, name: order.User.name } : null,
        totalPrice: order.totalPrice,
        shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        items: order.Books.map((book) => ({
          orderItemId: book.OrderItem.id,
          title: book.title,
          price: book.OrderItem.price,
          quantity: book.OrderItem.quantity,
          totalPrice: book.OrderItem.price * book.OrderItem.quantity,
        })),
      };
    });

    res.status(200).json({ orders: formattedOrders });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Order Upadate
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.body.orderId;
    const { status, paymentStatus } = req.body;

    const updatedOrder = await sequelize.transaction(async (t) => {
      const order = await Order.findByPk(orderId, {
        include: [{ model: OrderItem, include: [Book] }, { model: User }],
        transaction: t,
      });

      if (!order) throw new Error("Order not found");

      if (
        (status === "canceled" || status === "canceledBeforeShipping") &&
        order.status === "pending"
      ) {
        for (const item of order.OrderItems) {
          if (item.Book) {
            item.Book.stock += item.quantity;
            await item.Book.save({ transaction: t });
          }
        }
      }

      if (status) order.status = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      await order.save({ transaction: t });

      // format order to return
      return {
        orderId: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        user: order.User ? { id: order.User.id, name: order.User.name } : null,
        totalPrice: order.totalPrice,
        items: order.OrderItems.map((item) => ({
          orderItemId: item.id,
          title: item.Book ? item.Book.title : "Unknown",
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
        })),
      };
    });

    // respond after transaction completes
    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
