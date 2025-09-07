import { jest } from "@jest/globals";

// Mock generateToken first
jest.unstable_mockModule("../utils/generateToken.js", () => ({
  __esModule: true,
  default: jest.fn(() => "fake-jwt-token"),
}));

// Mock bcrypt BEFORE importing
jest.unstable_mockModule("bcrypt", () => ({
  __esModule: true,
  default: { compare: jest.fn() }, // default import
}));

import fs from "fs";
import path from "path";

// Now dynamically import modules AFTER mocks
const dbModule = await import("../models/index.js");
const controller = await import("../controller/user.controller.js");
const bcryptModule = await import("bcrypt"); // import mocked bcrypt

const db = dbModule.default;
const { User } = db;
const { loginUser, createUser, getUsers, logoutUser, deleteUser, updateUser } =
  controller;
const bcrypt = bcryptModule.default;

// Mock req & res helpers
const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("User Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- getUsers tests ---
  test("getUsers - should return list of users", async () => {
    const req = mockRequest();
    const res = mockResponse();

    const fakeUsers = [{ id: 1, username: "test" }];
    jest.spyOn(User, "findAll").mockResolvedValue(fakeUsers);

    await getUsers(req, res);

    expect(User.findAll).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeUsers });
  });

  test("getUsers - should handle errors", async () => {
    const req = mockRequest();
    const res = mockResponse();

    jest.spyOn(User, "findAll").mockRejectedValue(new Error("DB error"));

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "DB error",
    });
  });

  // --- createUser tests ---
  test("createUser - should create a new user successfully", async () => {
    const req = mockRequest({
      name: "Test",
      username: "ali",
      email: "test@example.com",
      password: "test@1234",
    });
    const res = mockResponse();

    jest.spyOn(User, "findOne").mockResolvedValue(null);

    const fakeUser = {
      id: 1,
      name: "Test",
      username: "ali",
      email: "test@example.com",
      save: jest.fn(),
    };
    jest.spyOn(User, "create").mockResolvedValue(fakeUser);

    await createUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(User.create).toHaveBeenCalledWith({
      name: "Test",
      username: "ali",
      email: "test@example.com",
      password: "test@1234",
      photo: null,
    });
    expect(fakeUser.save).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User created successfully",
      newUser: {
        id: 1,
        name: "Test",
        username: "ali",
      },
      token: "fake-jwt-token", // ✅ now always mocked
    });
  });

  test("createUser - should return 400 if email already exists", async () => {
    const req = mockRequest({ email: "existing@example.com" });
    const res = mockResponse();

    jest
      .spyOn(User, "findOne")
      .mockResolvedValue({ id: 1, email: "existing@example.com" });

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already exists" });
  });

  test("createUser - should handle errors", async () => {
    const req = mockRequest({ email: "error@example.com" });
    const res = mockResponse();

    jest.spyOn(User, "findOne").mockRejectedValue(new Error("DB error"));

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  // --- loginUser tests ---

  test("should login successfully with valid credentials", async () => {
    const req = mockRequest({
      email: "test@example.com",
      password: "test@1234",
    });
    const res = mockResponse();

    const fakeUser = {
      id: 1,
      name: "Test",
      username: "ali",
      email: "test@example.com",
      password: "hashedpassword",
      photo: null,
      isAdmin: false,
      save: jest.fn(),
    };

    jest.spyOn(User, "findOne").mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true); // ✅ correct password

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login Successful",
      user: {
        id: 1,
        name: "Test",
        username: "ali",
        email: "test@example.com",
        photo: null,
        isAdmin: false,
      },
      token: "fake-jwt-token",
    });
  });

  test("should return 401 if password is invalid", async () => {
    const req = mockRequest({ email: "test@example.com", password: "wrong" });
    const res = mockResponse();

    const fakeUser = { id: 1, email: "test@example.com", password: "hashed" };
    jest.spyOn(User, "findOne").mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(false); // ❌ wrong password

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credential" });
  });

  // --- logoutUser tests ---
  test("should logout successfully", async () => {
    const req = { user: { id: 1 } };
    const res = mockResponse();

    const fakeUser = { id: 1, token: "fake-jwt-token", save: jest.fn() };

    jest.spyOn(User, "findByPk").mockResolvedValue(fakeUser);

    await logoutUser(req, res);

    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(fakeUser.token).toBe(null);
    expect(fakeUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Logged out successfully",
    });
  });

  test("should return 404 if user is unauthorized", async () => {
    const req = {}; // no user
    const res = mockResponse();

    await logoutUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  test("should handle DB error during logout", async () => {
    const req = { user: { id: 1 } };
    const res = mockResponse();

    jest.spyOn(User, "findByPk").mockRejectedValue(new Error("DB error"));

    await logoutUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
  });

  //----- Delete User -----
  test("should delete user successfully without photo", async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();

    const fakeUser = { id: 1, photo: null, destroy: jest.fn() };
    jest.spyOn(User, "findByPk").mockResolvedValue(fakeUser);

    await deleteUser(req, res);

    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(fakeUser.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User deleted successfully",
    });
  });

  test("should delete user successfully with photo", async () => {
    const req = { params: { id: 2 } };
    const res = mockResponse();

    const fakeUser = {
      id: 2,
      photo: "uploads/test.jpg",
      destroy: jest.fn(),
    };

    jest.spyOn(User, "findByPk").mockResolvedValue(fakeUser);
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "unlinkSync").mockImplementation(() => {}); // mock delete

    await deleteUser(req, res);

    expect(fs.existsSync).toHaveBeenCalledWith(
      path.join("uploads", path.basename(fakeUser.photo))
    );
    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(fakeUser.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User deleted successfully",
    });
  });

  test("should return 404 if user not found", async () => {
    const req = { params: { id: 99 } };
    const res = mockResponse();

    jest.spyOn(User, "findByPk").mockResolvedValue(null);

    await controller.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("should handle DB error", async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();

    jest.spyOn(User, "findByPk").mockRejectedValue(new Error("DB error"));

    await controller.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  //--- update user ---

  test("should return 404 if user not found", async () => {
    const req = { params: { id: 1 }, body: { name: "New" } };
    const res = mockResponse();

    jest.spyOn(User, "findByPk").mockResolvedValue(null);

    await controller.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("should update user fields without photo", async () => {
    const req = {
      params: { id: 1 },
      body: { name: "NewName", email: "new@example.com" },
    };
    const res = mockResponse();

    const fakeUser = {
      id: 1,
      name: "Old",
      username: "olduser",
      email: "old@example.com",
      photo: null,
      isAdmin: false,
      save: jest.fn(),
    };

    jest.spyOn(User, "findByPk").mockResolvedValue(fakeUser);

    await updateUser(req, res);

    expect(fakeUser.name).toBe("NewName");
    expect(fakeUser.email).toBe("new@example.com");
    expect(fakeUser.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User updated successfully",
      data: {
        id: 1,
        name: "NewName",
        username: "olduser",
        email: "new@example.com",
        photo: null,
        isAdmin: false,
      },
    });
  });

  test("should update user with new photo and remove old one", async () => {
    const req = {
      params: { id: 2 },
      body: {},
      file: { filename: "newphoto.jpg" },
    };
    const res = mockResponse();

    const fakeUser = {
      id: 2,
      name: "Test",
      username: "ali",
      email: "test@example.com",
      photo: "uploads/oldphoto.jpg",
      isAdmin: false,
      save: jest.fn(),
    };

    jest.spyOn(User, "findByPk").mockResolvedValue(fakeUser);
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest.spyOn(fs, "unlinkSync").mockImplementation(() => {});

    await controller.updateUser(req, res);

    expect(fs.existsSync).toHaveBeenCalledWith(
      path.join("uploads", path.basename("uploads/oldphoto.jpg"))
    );
    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(fakeUser.photo).toBe("newphoto.jpg");
    expect(fakeUser.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User updated successfully",
      data: {
        id: 2,
        name: "Test",
        username: "ali",
        email: "test@example.com",
        photo: "newphoto.jpg",
        isAdmin: false,
      },
    });
  });

  test("should update user with new photo but no old file exists", async () => {
    const req = {
      params: { id: 3 },
      body: {},
      file: { filename: "newphoto2.jpg" },
    };
    const res = mockResponse();

    const fakeUser = {
      id: 3,
      name: "Test2",
      username: "khan",
      email: "khan@example.com",
      photo: "uploads/oldphoto2.jpg",
      isAdmin: true,
      save: jest.fn(),
    };

    jest.spyOn(User, "findByPk").mockResolvedValue(fakeUser);
    jest.spyOn(fs, "existsSync").mockReturnValue(false);

    await updateUser(req, res);

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fakeUser.photo).toBe("newphoto2.jpg");
    expect(fakeUser.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User updated successfully",
      data: {
        id: 3,
        name: "Test2",
        username: "khan",
        email: "khan@example.com",
        photo: "newphoto2.jpg",
        isAdmin: true,
      },
    });
  });

  test("should handle DB error", async () => {
    const req = { params: { id: 1 }, body: { name: "Error" } };
    const res = mockResponse();

    jest.spyOn(User, "findByPk").mockRejectedValue(new Error("DB error"));

    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });
});
