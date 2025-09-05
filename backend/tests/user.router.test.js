import request from "supertest";
import app from "../index.js";
import db from "../models/index.js";

const { User } = db;

beforeAll(async () => {
  // reset test DB before all tests
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close(); // close DB after all tests
});

describe("User Routes", () => {
  let userId;
  let token;

  test("Register a new user", async () => {
    const randomEmail = `test${Date.now()}@example.com`;
    const res = await request(app).post("/users/auth/register").send({
      name: "Test",
      username: "ali",
      email: randomEmail,
      password: "test@123",
    });

    userId = res.body.newUser.id;
    token = res.body.token;

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("newUser");
    expect(res.body.newUser).toHaveProperty("id");
    expect(res.body.newUser).toHaveProperty("username", "ali");
  });

  test("Login a user", async () => {
    const plainPassword = "test@123";

    await db.User.create({
      name: "Test",
      username: "ali",
      email: "login@example.com",
      password: plainPassword, // hashed by hook
    });

    const res = await request(app)
      .post("/users/auth/login")
      .send({ email: "login@example.com", password: plainPassword });

    token = res.body.token;

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email", "login@example.com");
  });

  test("Logout a user", async () => {
    const user = await db.User.create({
      name: "LogoutTest",
      username: "logoutUser",
      email: "logout@example.com",
      password: "test@123",
    });

    const loginRes = await request(app)
      .post("/users/auth/login")
      .send({ email: "logout@example.com", password: "test@123" });

    token = loginRes.body.token;

    const res = await request(app)
      .post("/users/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Logged out successfully");

    const updatedUser = await User.findByPk(user.id);
    expect(updatedUser.token).toBeNull();
  });

  test("Delete a user", async () => {
    const deleteUser = await db.User.create({
      name: "DeleteTest",
      username: "deleteUser",
      email: `delete${Date.now()}@example.com`,
      password: "test@123",
    });

    // login to get fresh token
    const loginRes = await request(app)
      .post("/users/auth/login")
      .send({ email: deleteUser.email, password: "test@123" });

    token = loginRes.body.token;
    userId = deleteUser.id;

    const res = await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User deleted successfully");

    const deletedUser = await User.findByPk(userId);
    expect(deletedUser).toBeNull();
  });

  test("Update user", async () => {
    // Create a user for update test
    const updateUser = await db.User.create({
      name: "Old Name",
      username: "oldUser",
      email: `update${Date.now()}@example.com`,
      password: "test@123",
    });

    // Login to get token
    const loginRes = await request(app)
      .post("/users/auth/login")
      .send({ email: updateUser.email, password: "test@123" });

    const updateToken = loginRes.body.token;

    // Send update request
    const res = await request(app)
      .put(`/users/${updateUser.id}`)
      .set("Authorization", `Bearer ${updateToken}`)
      .send({
        name: "Updated Name",
        username: "updatedUser",
        email: `updated${Date.now()}@example.com`,
      });

    // Assertions
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("message", "User updated successfully");
    expect(res.body.data).toHaveProperty("username", "updatedUser");

    // Verify DB updated
    const freshUser = await User.findByPk(updateUser.id);
    expect(freshUser.name).toBe("Updated Name");
    expect(freshUser.username).toBe("updatedUser");
  });
});
