import request from "supertest";
import app from "../index.js"; // your Express app
import db from "../models/index.js";

describe("User Routes", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("Register a new user", async () => {
    const res = await request(app).post("/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Test User");
  });

  test("Login with registered user", async () => {
    const res = await request(app).post("/users/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
