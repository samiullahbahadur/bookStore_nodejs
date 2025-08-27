import express from "express";

import authenticate from "../middleware/auth.js";
import isAdmin from "../middleware/Admin.js";
import cartAccess from "../middleware/cartAccess.js";
import {
  addToCart,
  getCart,
  removeCartItem,
  removeCart,
  updateQuantity,
} from "../controller/cart.controller.js";
const router = express.Router();

// ==========================
// User Routes
// ==========================
// Add item to cart (any logged-in user)
router.post("/", authenticate, addToCart);

// Get current user's cart (only own cart)
router.get("/", authenticate, getCart);

// Remove a single item from a cart (must own cart)
router.delete("/item/:cartItemId", authenticate, removeCartItem);

// quantity update increase/decrease
router.put("/item/:cartItemId", authenticate, updateQuantity);
// ==========================
// Admin Routes
// ==========================

// Admin can view all carts
router.get("/admin/all", authenticate, isAdmin, getCart);

// Admin can remove any cart item
router.delete("/admin/item/:cartItemId", authenticate, isAdmin, removeCartItem);

export default router;
