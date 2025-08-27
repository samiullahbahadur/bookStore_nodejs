// Middleware to ensure users only access their own cart
import db from "../models/index.js";
const { Cart } = db;

const cartAccess = async (req, res, next) => {
  const userId = req.user.id;
  const isAdmin = req.user.isAdmin;
  const { cartId } = req.params;

  const cart = await Cart.findByPk(cartId);

  if (!cart)
    return res.status(404).json({ message: "Cart not found from cartAccess" });

  if (!isAdmin && cart.userId !== userId) {
    return res.status(403).json({ message: "Forbidden: Not your cart" });
  }

  req.cart = cart;
  next();
};
export default cartAccess;
