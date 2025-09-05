import request from "supertest";
import app from "../index.js"; // your Express app
import db from "../models/index.js";

const { Book, User } = db;

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
});
