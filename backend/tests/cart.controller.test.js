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
      jest.spyOn(Cart, "findOne").mockResolvedValue({ id: 1 });

      req.body = { bookId: 99, quantity: 1 };

      await addToCart(req, res);

      expect(Book.findByPk).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    test("should return 400 if not enough stock", async () => {
      const fakeBook = { id: 1, stock: 1, save: jest.fn() };
      jest.spyOn(Book, "findByPk").mockResolvedValue(fakeBook);
      jest.spyOn(Cart, "findOne").mockResolvedValue({ id: 1 });
      jest.spyOn(CartItem, "findOne").mockResolvedValue(null);

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

      const mockCarts = [
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
      ];

      jest.spyOn(Cart, "findAll").mockResolvedValue(mockCarts);

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

      const mockCarts = [
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
      ];

      jest.spyOn(Cart, "findAll").mockResolvedValue(mockCarts);

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

  // ----removecartItem----
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

    expect(fakeBook.stock).toBe(7); // stock restored
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
