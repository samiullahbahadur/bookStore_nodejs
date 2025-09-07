import { jest } from "@jest/globals";
import {
  addToCart,
  getCart,
  removeCartItem,
} from "../controller/cart.controller.js";
import db from "../models/index.js";

const { Book, Cart, CartItem } = db;

describe("Cart Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { cartItemId: 1 }, // <-- required for removeCartItem
      user: { id: 1, isAdmin: false },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  // ---- addToCart ----
  describe("removeCartItem", () => {
    let req, res;

    beforeEach(() => {
      req = {
        params: { cartItemId: 1 },
        user: { id: 1, isAdmin: false },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });

    test("should return 404 if cart item not found", async () => {
      jest.spyOn(CartItem, "findOne").mockResolvedValue(null);

      await removeCartItem(req, res);

      expect(CartItem.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        include: [Book, { model: Cart, attributes: ["id", "userId"] }],
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cart item not found From DB",
      });
    });

    test("should return 403 if user is not owner and not admin", async () => {
      const fakeCartItem = {
        id: 1,
        quantity: 2,
        Cart: { userId: 2 },
        Book: { stock: 5, save: jest.fn() },
      };
      jest.spyOn(CartItem, "findOne").mockResolvedValue(fakeCartItem);

      await removeCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Forbidden: Not your cart item",
      });
    });

    test("should remove cart item and restore stock for owner", async () => {
      const fakeBook = { id: 1, stock: 5, save: jest.fn() };
      const fakeCartItem = {
        id: 1,
        quantity: 2,
        Cart: { userId: 1 },
        Book: fakeBook,
        destroy: jest.fn(),
      };
      jest.spyOn(CartItem, "findOne").mockResolvedValue(fakeCartItem);

      await removeCartItem(req, res);

      expect(fakeBook.stock).toBe(7); // 5 + 2
      expect(fakeBook.save).toHaveBeenCalled();
      expect(fakeCartItem.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cart item removed successfully",
        cartItemId: 1,
      });
    });

    test("should allow admin to remove any cart item", async () => {
      req.user.isAdmin = true;

      const fakeBook = { id: 1, stock: 5, save: jest.fn() };
      const fakeCartItem = {
        id: 1,
        quantity: 2,
        Cart: { userId: 2 },
        Book: fakeBook,
        destroy: jest.fn(),
      };
      jest.spyOn(CartItem, "findOne").mockResolvedValue(fakeCartItem);

      await removeCartItem(req, res);

      expect(fakeBook.stock).toBe(7); // 5 + 2
      expect(fakeBook.save).toHaveBeenCalled();
      expect(fakeCartItem.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cart item removed successfully",
        cartItemId: 1,
      });
    });
  });
});
