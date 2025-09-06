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

// Now dynamically import modules AFTER mocks
const dbModule = await import("../models/index.js");
const controller = await import("../controller/user.controller.js");
const bcryptModule = await import("bcrypt"); // import mocked bcrypt

const db = dbModule.default;
const { User } = db;
const { loginUser, createUser, getUsers } = controller;
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
});
