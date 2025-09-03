import request from "supertest";
import app from "../index.js"; // your Express app

describe("User Routes", () => {
  test("Register a new user", async () => {
    const res = await request(app)
      .post("/users/auth/register")
      .send({ name: "Test", email: "test@example.com", password: "test@123" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });
});
