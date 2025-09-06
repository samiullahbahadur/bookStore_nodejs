import request from "supertest";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import app from "../index.js"; // your Express app
import db from "../models/index.js";
const { User, Book } = db;
let adminToken;

// ✅ Top-level hooks
beforeAll(async () => {
  await db.sequelize.sync({ force: true });

  // Create admin user
  const admin = await User.create({
    name: "Admin",
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    isAdmin: true,
  });

  const res = await request(app).post("/users/auth/login").send({
    email: "admin@example.com",
    password: "admin123",
  });

  adminToken = res.body.token;
});

afterAll(async () => {
  await db.sequelize.close();
});

beforeEach(async () => {
  await Book.destroy({ where: {} });
});

// ✅ Tests at top level too
describe("Books Routes", () => {
  test("GET /books - returns empty array", async () => {
    const res = await request(app).get("/books");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /books - returns list of books", async () => {
    const book1 = await Book.create({
      title: "Book 1",
      author: "Author 1",
      price: 10,
      stock: 5,
    });
    const book2 = await Book.create({
      title: "Book 2",
      author: "Author 2",
      price: 15,
      stock: 3,
    });

    const res = await request(app).get("/books");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  test("GET /books/:id - returns single book", async () => {
    const book = await Book.create({
      title: "Single Book",
      author: "Author Single",
      price: 20,
      stock: 2,
    });

    const res = await request(app).get(`/books/${book.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", book.id);
    expect(res.body).toHaveProperty("title", "Single Book");
  });

  test("GET /books/:id - returns 404 if book not found", async () => {
    const res = await request(app).get("/books/9999");

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Book not found");
  });

  // --- CREATE BOOK ---
  test("POST /books - should create a book", async () => {
    const res = await request(app)
      .post("/books/register") // note the route
      .set("Authorization", `Bearer ${adminToken}`)
      .field("title", "New Book")
      .field("description", "Test description")
      .field("price", "25")
      .field("author", "Tester")
      .field("stock", "10")
      .attach("photo", path.join(__dirname, "test-files", "test.jpg")); // 👈 attach file

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("title", "New Book");
  });

  test("POST /books - should fail without token", async () => {
    const res = await request(app).post("/books/register").send({
      title: "Fail Book",
      description: "Should not work",
      price: 30,
      author: "NoAuth",
      stock: 5,
    });

    expect(res.statusCode).toBe(401); // unauthorized
  });

  // --- UPDATE BOOK ---
  test("PUT /books/:id - should update a book", async () => {
    const book = await Book.create({
      title: "Old Title",
      author: "Old Author",
      price: 15,
      stock: 3,
    });

    const res = await request(app)
      .put(`/books/${book.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Updated Title",
        price: 20,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("title", "Updated Title");
    expect(res.body.data).toHaveProperty("price", 20);
  });

  test("PUT /books/:id - returns 404 if not found", async () => {
    const res = await request(app)
      .put("/books/9999")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Not Found" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Book not found");
  });

  // --- DELETE BOOK ---
  test("DELETE /books/:id - should delete a book", async () => {
    const book = await Book.create({
      title: "To Delete",
      author: "Author",
      price: 12,
      stock: 4,
    });

    const res = await request(app)
      .delete(`/books/${book.id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Book deleted successfully");
  });

  test("DELETE /books/:id - returns 404 if not found", async () => {
    const res = await request(app)
      .delete("/books/9999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Book not found");
  });
});
