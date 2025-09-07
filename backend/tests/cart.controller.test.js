import { jest } from "@jest/globals";
import { addToCart, getCart } from "../controller/cart.controller.js";
import db from "../models/index.js";

const { Book, Cart, CartItem, User } = db;

describe("Cart Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, user: { id: 1, isAdmin: false } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  // ---- addToCart ----
  describe("addToCart", () => {
    test("should return 404 if book not found", async () => {
      jest.spyOn(Book, "findByPk").mockResolvedValue(null);

      req.body = { bookId: 99, quantity: 1 };

      await addToCart(req, res);

      expect(Book.findByPk).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    test("should return 400 if not enough stock", async () => {
      const fakeBook = { id: 1, stock: 1, save: jest.fn() };
      jest.spyOn(Book, "findByPk").mockResolvedValue(fakeBook);

      req.body = { bookId: 1, quantity: 5 };

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

      jest.spyOn(Book, "findByPk").mockResolvedValue(fakeBook);
      jest.spyOn(Cart, "findOne").mockResolvedValue(fakeCart);
      jest.spyOn(CartItem, "findOne").mockResolvedValue(null);
      jest.spyOn(CartItem, "create").mockResolvedValue(fakeCartItem);

      req.body = { bookId: 1, quantity: 2 };

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeCartItem);
      expect(fakeBook.save).toHaveBeenCalled();
    });
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
});
