import db from "../models/index.js";
const { User, Cart, CartItem, Book } = db;

// 🛒 Create or Get User Cart

export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    const userId = req.user.id;

    // 1️⃣ Find or create a cart for the user
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // 2️⃣ Find the book and check stock
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // 3️⃣ Check if book is already in cart
    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, bookId },
    });

    if (existingItem) {
      // Deduct stock
      book.stock -= quantity;
      await book.save();

      // Update cart quantity
      existingItem.quantity += quantity;
      await existingItem.save();

      return res.status(200).json(existingItem);
    } else {
      // Deduct stock
      book.stock -= quantity;
      await book.save();

      // Add new book to cart
      const newItem = await CartItem.create({
        cartId: cart.id,
        bookId,
        quantity,
      });

      return res.status(200).json(newItem);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🛒 Get Cart and CartItems

export const getCart = async (req, res) => {
  try {
    let carts;
    if (req.user.isAdmin) {
      // Admin: get all carts
      carts = await Cart.findAll({
        include: [
          {
            model: Book,
            through: { model: CartItem, attributes: ["id", "quantity"] },
          },
          { model: User, attributes: ["id", "name"] }, // optional
        ],
      });
    } else {
      // Regular user: get only their cart
      carts = await Cart.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Book,
            through: { model: CartItem, attributes: ["id", "quantity"] },
          },
          {
            model: User,
            attributes: ["id", "name"], // include user info
          },
        ],
      });
    }

    console.log("Fetched carts:", JSON.stringify(carts, null, 2));

    // Transform data to frontend-friendly format
    const formatted = carts
      .map((cart) => ({
        cartId: cart.id,
        userId: cart.userId,
        userName: cart.User ? cart.User.name : "Unknown",
        items: cart.Books.map((book) => ({
          cartItemId: book.CartItem.id,
          id: book.id,
          title: book.title,
          price: book.price,
          quantity: book.CartItem.quantity,
          stock: book.stock,
          available: book.stock >= 0 && book.stock >= book.CartItem.quantity,
        })),
      }))
      .filter((cart) => cart.items.length > 0); // ⬅️ remove empty carts

    res.status(200).json({ carts: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    const cartItem = await CartItem.findOne({
      where: { id: cartItemId },
      include: [Book, { model: Cart, attributes: ["id", "userId"] }],
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found From DB" });
    }
    // Only check ownership if not admin
    if (!req.user.isAdmin && cartItem.Cart.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Not your cart item" });
    }
    // restore stock
    if (cartItem.Book) {
      cartItem.Book.stock += cartItem.quantity;
      await cartItem.Book.save();
    }

    await cartItem.destroy();

    res
      .status(200)
      .json({ message: "Cart item removed successfully", cartItemId });
  } catch (error) {
    console.error("REMOVE CART ITEM ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id;

    const cartItem = await CartItem.findOne({
      where: { id: cartItemId },
      include: [Book, Cart],
    });

    if (!cartItem || cartItem.Cart.userId !== userId) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // restore stock
    if (cartItem.Book) {
      cartItem.Book.stock += cartItem.quantity;
      await cartItem.Book.save();
    }

    await cartItem.destroy();

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (err) {
    console.error("DELETE CART ITEM ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    const cartItem = await CartItem.findByPk(req.params.cartItemId);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // find the related book
    const book = await Book.findByPk(cartItem.bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const oldQty = cartItem.quantity;
    const diff = quantity - oldQty; // positive if increase, negative if decrease

    if (diff > 0) {
      // user wants more items → decrease stock
      if (book.stock < diff) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      book.stock -= diff;
    } else if (diff < 0) {
      // user decreased qty → return stock
      book.stock += Math.abs(diff);
    }

    // update both
    cartItem.quantity = quantity;
    await cartItem.save();
    await book.save();

    res.status(200).json({
      message: "Cart updated successfully",
      cartItemId: cartItem.id,
      bookId: cartItem.bookId,
      quantity: cartItem.quantity,
    });
  } catch (error) {
    console.error("UpdateQuantity ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
