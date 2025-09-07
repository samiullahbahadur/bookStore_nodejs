import request from "supertest";
import { jest } from "@jest/globals";
import app from "../index.js"; // your Express app

// Mock models if needed, otherwise use real test DB
import db from "../models/index.js";
const { Book, Cart, CartItem } = db;

describe("Cart Controller - addToCart", () => {
  let testUser;
  let testBook;

  beforeAll(async () => {
    // Optional: create a test user
    testUser = { id: 1, name: "Test User" };

    // Create a test book in DB
    testBook = await Book.create({
      title: "Test Book",
      stock: 10,
      price: 20,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await CartItem.destroy({ where: {} });
    await Cart.destroy({ where: {} });
    await Book.destroy({ where: {} });
  });

  test("should add a new book to the cart if not already present", async () => {
    const res = await request(app)
      .post("/carts/") // your route
      .send({ bookId: testBook.id, quantity: 2 })
      .set("Authorization", `Bearer testToken`) // if you have auth middleware
      .expect(200);

    expect(res.body).toHaveProperty("cartId");
    expect(res.body).toHaveProperty("bookId", testBook.id);
    expect(res.body).toHaveProperty("quantity", 2);

    const updatedBook = await Book.findByPk(testBook.id);
    expect(updatedBook.stock).toBe(8); // stock reduced
  });

  test("should increase quantity if book already in cart", async () => {
    // First add
    await CartItem.create({ cartId: 1, bookId: testBook.id, quantity: 2 });

    const res = await request(app)
      .post("/cart/add")
      .send({ bookId: testBook.id, quantity: 3 })
      .set("Authorization", `Bearer testToken`)
      .expect(200);

    expect(res.body.quantity).toBe(5);

    const updatedBook = await Book.findByPk(testBook.id);
    expect(updatedBook.stock).toBe(5); // stock reduced again
  });

  test("should return 404 if book not found", async () => {
    const res = await request(app)
      .post("/cart/add")
      .send({ bookId: 9999, quantity: 1 })
      .set("Authorization", `Bearer testToken`)
      .expect(404);

    expect(res.body).toHaveProperty("message", "Book not found");
  });

  test("should return 400 if not enough stock", async () => {
    const res = await request(app)
      .post("/cart/add")
      .send({ bookId: testBook.id, quantity: 100 })
      .set("Authorization", `Bearer testToken`)
      .expect(400);

    expect(res.body).toHaveProperty("message", "Not enough stock available");
  });
});
