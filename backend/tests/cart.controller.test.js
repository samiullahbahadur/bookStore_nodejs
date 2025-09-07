import { addToCart, getCart } from "../controller/cart.controller.js";
import db from "../models/index.js";

// Extract models
const { Book, Cart, CartItem, User } = db;

// Create reusable mock response
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Cart Controller - Unit Tests", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe("addToCart", () => {
    test("should return 404 if book not found", async () => {
      req.user = { id: 1 };
      req.body = { bookId: 99, quantity: 2 };

      // Mock Book.findByPk to return null
      jest.spyOn(Book, "findByPk").mockResolvedValue(null);

      await addToCart(req, res);

      expect(Book.findByPk).toHaveBeenCalledWith(99);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
    });

    test("should return 400 if not enough stock", async () => {
      req.user = { id: 1 };
      req.body = { bookId: 1, quantity: 100 };

      const fakeBook = { id: 1, stock: 5 };
      jest.spyOn(Book, "findByPk").mockResolvedValue(fakeBook);

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not enough stock available",
      });
    });

    test("should add new item to cart", async () => {
      req.user = { id: 1 };
      req.body = { bookId: 1, quantity: 2 };

      const fakeBook = { id: 1, stock: 10, save: jest.fn() };
      jest.spyOn(Book, "findByPk").mockResolvedValue(fakeBook);

      const fakeCart = { id: 5, userId: 1 };
      jest.spyOn(Cart, "findOrCreate").mockResolvedValue([fakeCart]);

      const fakeCartItem = { id: 99, bookId: 1, quantity: 2 };
      jest.spyOn(CartItem, "findOne").mockResolvedValue(null);
      jest.spyOn(CartItem, "create").mockResolvedValue(fakeCartItem);

      await addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeCartItem);
      expect(fakeBook.save).toHaveBeenCalled();
    });
  });

  describe("getCart", () => {
    test("should return all carts if admin", async () => {
      req.user = { id: 1, isAdmin: true };

      const fakeCarts = [
        {
          id: 1,
          userId: 1,
          User: { id: 1, name: "Alice" },
          Books: [
            {
              id: 1,
              title: "Book A",
              price: 10,
              CartItem: { id: 11, quantity: 2 },
            },
          ],
        },
      ];

      jest.spyOn(Cart, "findAll").mockResolvedValue(fakeCarts);

      await getCart(req, res);

      expect(Cart.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        carts: [
          {
            cartId: 1,
            userId: 1,
            userName: "Alice",
            items: [
              {
                cartItemId: 11,
                id: 1,
                title: "Book A",
                price: 10,
                quantity: 2,
              },
            ],
          },
        ],
      });
    });

    test("should return only user’s carts if non-admin", async () => {
      req.user = { id: 2, isAdmin: false };

      const fakeCarts = [
        {
          id: 2,
          userId: 2,
          User: { id: 2, name: "Bob" },
          Books: [],
        },
      ];

      jest.spyOn(Cart, "findAll").mockResolvedValue(fakeCarts);

      await getCart(req, res);

      expect(Cart.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 2 } })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        carts: [
          {
            cartId: 2,
            userId: 2,
            userName: "Bob",
            items: [],
          },
        ],
      });
    });
  });
});
