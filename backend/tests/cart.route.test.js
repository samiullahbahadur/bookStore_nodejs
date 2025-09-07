import request from "supertest";
import express from "express";
import {
  addToCart,
  getCart,
  removeCartItem,
} from "../controller/cart.controller.js";
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

// Inject mock user for routes
app.post("/carts", async (req, res) => {
  req.user = testUser; // always logged-in as testUser for addToCart
  await addToCart(req, res);
});

app.get("/carts", async (req, res) => {
  req.user = req.headers.mockuser ? JSON.parse(req.headers.mockuser) : testUser;
  await getCart(req, res);
});

app.delete("/carts/:cartItemId", async (req, res) => {
  req.user = req.headers.mockuser ? JSON.parse(req.headers.mockuser) : testUser; // default testUser
  await removeCartItem(req, res);
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

describe("Cart Route", () => {
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
    await request(app).post("/carts").send({ bookId: 1, quantity: 1 });

    const res = await request(app)
      .get("/carts")
      .set("mockUser", JSON.stringify({ id: 2, isAdmin: true }));

    expect(res.status).toBe(200);
    expect(res.body.carts.length).toBeGreaterThan(0);
    expect(res.body.carts[0]).toHaveProperty("items");
  });

  // --- removeCartItem tests ---
  test("should remove a cart item and restore stock", async () => {
    const addRes = await request(app)
      .post("/carts")
      .send({ bookId: 1, quantity: 2 });

    const cartItemId = addRes.body.id || addRes.body.cartItemId;

    const res = await request(app).delete(`/carts/${cartItemId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Cart item removed successfully",
      cartItemId: String(cartItemId),
    });

    const book = await Book.findByPk(1);
    expect(book.stock).toBe(10);
  });

  test("should return 404 if cart item not found", async () => {
    const res = await request(app).delete("/carts/999");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Cart item not found From DB");
  });

  test("should return 403 if user tries to remove someone else’s item", async () => {
    const addRes = await request(app)
      .post("/carts")
      .send({ bookId: 1, quantity: 1 });

    const cartItemId = addRes.body.id || addRes.body.cartItemId;

    const res = await request(app)
      .delete(`/carts/${cartItemId}`)
      .set("mockUser", JSON.stringify({ id: 3, isAdmin: false }));

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("message", "Forbidden: Not your cart item");
  });
});
