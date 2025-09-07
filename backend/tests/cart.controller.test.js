import { jest } from "@jest/globals";
import {
  addToCart,
  getCart,
  removeCartItem,
  updateQuantity,
} from "../controller/cart.controller.js";
import db from "../models/index.js";

const { Book, Cart, CartItem } = db;

describe("Cart Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { cartItemId: 1 },
      body: {},
      user: { id: 1, isAdmin: false },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  // ---- addToCart ----
  describe("addToCart", () => {
    test("should return 404 if book not found", async () => {
    req.body = { bookId: 99, quantity: 1 }; // <-- initialize body before calling controller
    jest.spyOn(Book, "findByPk").mockResolvedValue(null);

    await addToCart(req, res);

    expect(Book.findByPk).toHaveBeenCalledWith(99); // now it will be called
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
  });

  test("should return 400 if not enough stock", async () => {
    const fakeBook = { id: 1, stock: 1, save: jest.fn() };
    req.body = { bookId: 1, quantity: 5 }; // initialize body
    jest.spyOn(Book, "findByPk").mockResolvedValue(fakeBook);

    await addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Not enough stock available",
    });
  });

  test("should add new item to cart", async () => {
    const fakeBook = { id: 1, stock: 10, save: jest.fn() };
    const fakeCart = { id: 123 };
    const fakeCartItem = { id: 999, cartId: 123, bookId: 1, quantity: 2 };

    req.body = { bookId: 1, quantity: 2 };

    jest.spyOn(Book, "findByPk").mockResolvedValue(fakeBook);
    jest.spyOn(Cart, "findOne").mockResolvedValue(fakeCart);
    jest.spyOn(CartItem, "findOne").mockResolvedValue(null);
    jest.spyOn(CartItem, "create").mockResolvedValue(fakeCartItem);

    await addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeCartItem);
    expect(fakeBook.save).toHaveBeenCalled();
  });

  // ---- getCart ----
  describe("getCart", () => {
    test("should return all carts if admin", async () => {
      req.user.isAdmin = true;
      jest.spyOn(Cart, "findAll").mockResolvedValue([
        {
          id: 1,
          userId: 1,
          User: { name: "Test User" },
          Books: [
            {
              id: 1,
              title: "Book 1",
              price: 10,
              CartItem: { id: 1, quantity: 2 },
            },
          ],
        },
      ]);

      await getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        carts: [
          {
            cartId: 1,
            userId: 1,
            userName: "Test User",
            items: [
              { cartItemId: 1, id: 1, title: "Book 1", price: 10, quantity: 2 },
            ],
          },
        ],
      });
    });

    test("should return only user’s carts if non-admin", async () => {
      req.user.isAdmin = false;
      jest.spyOn(Cart, "findAll").mockResolvedValue([
        {
          id: 2,
          userId: 1,
          User: { name: "Test User" },
          Books: [
            {
              id: 2,
              title: "Book 2",
              price: 20,
              CartItem: { id: 2, quantity: 1 },
            },
          ],
        },
      ]);

      await getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        carts: [
          {
            cartId: 2,
            userId: 1,
            userName: "Test User",
            items: [
              { cartItemId: 2, id: 2, title: "Book 2", price: 20, quantity: 1 },
            ],
          },
        ],
      });
    });
  });

  // ---- removeCartItem ----
  describe("removeCartItem", () => {
    test("should return 404 if cart item not found", async () => {
      jest.spyOn(CartItem, "findOne").mockResolvedValue(null);

      await removeCartItem(req, res);

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

      expect(fakeBook.stock).toBe(7); // restored
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

      expect(fakeBook.stock).toBe(7);
      expect(fakeBook.save).toHaveBeenCalled();
      expect(fakeCartItem.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cart item removed successfully",
        cartItemId: 1,
      });
    });
  });

  // ---- updateQuantity ----
  describe("updateQuantity", () => {
    test("should return 400 if quantity <= 0", async () => {
      req.body.quantity = 0;
      await updateQuantity(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Quantity must be greater than 0",
      });
    });

    test("should return 404 if cart item not found", async () => {
      jest.spyOn(CartItem, "findByPk").mockResolvedValue(null);
      req.body.quantity = 5;
      await updateQuantity(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cart item not found" });
    });

    test("should return 404 if book not found", async () => {
      const fakeCartItem = { id: 1, bookId: 10, quantity: 2, save: jest.fn() };
      jest.spyOn(CartItem, "findByPk").mockResolvedValue(fakeCartItem);
      jest.spyOn(Book, "findByPk").mockResolvedValue(null);
      req.body.quantity = 5;

      await updateQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    test("should return 400 if not enough stock when increasing", async () => {
      const fakeCartItem = { id: 1, bookId: 1, quantity: 2, save: jest.fn() };
      const fakeBook = { id: 1, stock: 1, save: jest.fn() };
      jest.spyOn(CartItem, "findByPk").mockResolvedValue(fakeCartItem);
      jest.spyOn(Book, "findByPk").mockResolvedValue(fakeBook);
      req.body.quantity = 5;

      await updateQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not enough stock available",
      });
    });

    test("should increase quantity and decrease book stock", async () => {
      const fakeCartItem = { id: 1, bookId: 1, quantity: 2, save: jest.fn() };
      const fakeBook = { id: 1, stock: 10, save: jest.fn() };
      jest.spyOn(CartItem, "findByPk").mockResolvedValue(fakeCartItem);
      jest.spyOn(Book, "findByPk").mockResolvedValue(fakeBook);
      req.body.quantity = 5;

      await updateQuantity(req, res);

      expect(fakeBook.stock).toBe(7);
      expect(fakeBook.save).toHaveBeenCalled();
      expect(fakeCartItem.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cart updated successfully",
        cartItemId: 1,
        bookId: 1,
        quantity: 5,
      });
    });

    test("should decrease quantity and restore book stock", async () => {
      const fakeCartItem = { id: 1, bookId: 1, quantity: 5, save: jest.fn() };
      const fakeBook = { id: 1, stock: 7, save: jest.fn() };
      jest.spyOn(CartItem, "findByPk").mockResolvedValue(fakeCartItem);
      jest.spyOn(Book, "findByPk").mockResolvedValue(fakeBook);
      req.body.quantity = 3;

      await updateQuantity(req, res);

      expect(fakeBook.stock).toBe(9);
      expect(fakeBook.save).toHaveBeenCalled();
      expect(fakeCartItem.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cart updated successfully",
        cartItemId: 1,
        bookId: 1,
        quantity: 3,
      });
    });
  });
});
