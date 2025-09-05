import { jest } from "@jest/globals";
// Mock generateToken BEFORE importing the controller
jest.mock("../utils/generateToken.js", () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue("fake-jwt-token"),
}));

import { getUsers, createUser } from "../controller/user.controller.js";
import db from "../models/index.js";

const { User } = db;

// Mock req & res
const mockRequest = (body = {}, file = null) => ({ body, file });
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

    // ✅ No need to spy on generateToken; already mocked

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
      token: "fake-jwt-token", // ✅ this should now pass
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
});
