import request from "supertest";
import express from "express";
import { addToCart, getCart } from "../controller/cart.controller.js";
import db from "../models/index.js";

const { User, Book, Cart, CartItem } = db;

const app = express();
app.use(express.json());

// Create test user beforeAll
let testUser;
let adminUser;

beforeAll(async () => {
  await db.sequelize.sync({ force: true }); // recreate tables

  testUser = await User.create({
    id: 1,
    name: "Test User",
    email: "test@example.com",
    isAdmin: false,
  });

  adminUser = await User.create({
    id: 2,
    name: "Admin User",
    email: "admin@example.com",
    isAdmin: true,
  });
});

// Inject mock user for POST /carts
app.post("/carts", async (req, res) => {
  req.user = testUser; // always logged-in as testUser for addToCart
  try {
    await addToCart(req, res);
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ message: err.message });
  }
});

// Inject mock user for GET /carts
app.get("/carts", async (req, res) => {
  // simulate user from request header
  req.user = req.headers.mockuser ? JSON.parse(req.headers.mockuser) : testUser;
  try {
    await getCart(req, res);
  } catch (err) {
    console.error("Error in getCart:", err);
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

describe("Cart Controller", () => {
  // --- addToCart tests ---
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
    await request(app).post("/carts").send({ bookId: 1, quantity: 2 });

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

  // --- getCart tests ---
  test("should return only the logged-in user's cart (non-admin)", async () => {
    // first add books into cart
    await request(app).post("/carts").send({ bookId: 1, quantity: 2 });

    const res = await request(app)
      .get("/carts")
      .set("mockUser", JSON.stringify({ id: 1, isAdmin: false }));

    expect(res.status).toBe(200);
    expect(res.body.carts.length).toBe(1);
    expect(res.body.carts[0].userId).toBe(1);
    expect(res.body.carts[0].items.length).toBe(1);
    expect(res.body.carts[0].items[0]).toHaveProperty("quantity", 2);
  });

  test("should return all carts if user is admin", async () => {
    // Add a book to testUser's cart
    await request(app).post("/carts").send({ bookId: 1, quantity: 1 });

    const res = await request(app)
      .get("/carts")
      .set("mockUser", JSON.stringify({ id: 2, isAdmin: true }));

    expect(res.status).toBe(200);
    expect(res.body.carts.length).toBeGreaterThan(0);
    expect(res.body.carts[0]).toHaveProperty("items");
  });
});
