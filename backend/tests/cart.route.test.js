import request from "supertest";
import express from "express";
import { addToCart } from "../controller/cart.controller.js";
import db from "../models/index.js";

const { User, Book, Cart, CartItem } = db;

const app = express();
app.use(express.json());

// Create test user beforeAll
let testUser;

beforeAll(async () => {
  await db.sequelize.sync({ force: true }); // recreate tables
  testUser = await User.create({
    id: 1,
    name: "Test User",
    email: "test@example.com",
  });
});

// Inject mock user for all requests
app.post("/carts", async (req, res) => {
  req.user = testUser; // inject Sequelize user instance
  try {
    await addToCart(req, res);
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ message: err.message });
  }
});

// Clear tables before each test
beforeEach(async () => {
  await CartItem.destroy({ where: {} });
  await Cart.destroy({ where: {} });
  await Book.destroy({ where: {} });

  await Book.create({
    id: 1,
    title: "Test Book",
    stock: 10,
    price: 20,
    userId: testUser.id,
  });
});

// Close DB connection after all tests
afterAll(async () => {
  await db.sequelize.close();
});

describe("Cart Controller - addToCart", () => {
  test("should add a new book to the cart if not already present", async () => {
    const res = await request(app)
      .post("/carts")
      .send({ bookId: 1, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("cartId");
    expect(res.body).toHaveProperty("bookId", 1);
    expect(res.body).toHaveProperty("quantity", 2);

    const book = await Book.findByPk(1);
    expect(book.stock).toBe(8);
  });

  test("should increase quantity if book already in cart", async () => {
    // First add
    await request(app).post("/carts").send({ bookId: 1, quantity: 2 });

    // Add again
    const res = await request(app)
      .post("/carts")
      .send({ bookId: 1, quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(5);

    const book = await Book.findByPk(1);
    expect(book.stock).toBe(5);
  });

  test("should return 404 if book not found", async () => {
    const res = await request(app)
      .post("/carts")
      .send({ bookId: 999, quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Book not found");
  });

  test("should return 400 if not enough stock", async () => {
    const res = await request(app)
      .post("/carts")
      .send({ bookId: 1, quantity: 100 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Not enough stock available");
  });
});
