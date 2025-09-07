import { jest } from "@jest/globals";

// Mock fs before importing controller
jest.unstable_mockModule("fs", () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Mock Book model
const mockBookModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

// Mock db
jest.unstable_mockModule("../models/index.js", () => ({
  default: { Book: mockBookModel },
}));

// Import fs AFTER mocking
const fs = await import("fs"); // ✅ namespace import

// Import controller AFTER mocks
const controller = await import("../controller/book.controller.js");
const { getBooks, getBookById, creatBooks, deleteBook, updateBook } =
  controller;

// --- Mock response helper ---
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Book Controller", () => {
  afterEach(() => jest.clearAllMocks());

  test("getBooks returns list of books", async () => {
    const mockBooks = [{ id: 1, title: "Book 1" }];
    mockBookModel.findAll.mockResolvedValue(mockBooks);

    const res = mockResponse();
    await getBooks({}, res);

    expect(mockBookModel.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockBooks });
  });

  test("getBookById returns 404 if not found", async () => {
    mockBookModel.findByPk.mockResolvedValue(null);

    const res = mockResponse();
    await getBookById({ params: { id: 99 } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Book not found" });
  });

  test("creatBooks creates a book", async () => {
    const mockBook = { id: 1, title: "New Book" };
    mockBookModel.create.mockResolvedValue(mockBook);

    const req = {
      body: { title: "New Book", price: 10 },
      file: null,
      user: { id: 5 },
    };
    const res = mockResponse();

    await creatBooks(req, res);

    expect(mockBookModel.create).toHaveBeenCalledWith({
      title: "New Book",
      description: undefined,
      price: 10,
      photo: null,
      author: undefined,
      stock: undefined,
      userId: 5,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Book added successfully!",
      data: mockBook,
    });
  });

  test("deleteBook removes book and file", async () => {
    const mockBook = { id: 1, photo: "test.jpg", destroy: jest.fn() };
    mockBookModel.findByPk.mockResolvedValue(mockBook);
    fs.existsSync.mockReturnValue(true);

    const req = { params: { id: 1 } };
    const res = mockResponse();

    await deleteBook(req, res);

    expect(fs.existsSync).toHaveBeenCalledWith(
      expect.stringContaining("test.jpg")
    );
    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(mockBook.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      success: true,
      message: "Book deleted successfully",
    });
  });

  test("updateBook updates fields", async () => {
    const mockBook = { id: 1, title: "Old", save: jest.fn(), photo: null };
    mockBookModel.findByPk.mockResolvedValue(mockBook);

    const req = {
      params: { id: 1 },
      body: { title: "Updated Title" },
      file: null,
    };
    const res = mockResponse();

    await updateBook(req, res);

    expect(mockBook.title).toBe("Updated Title");
    expect(mockBook.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Book updated successfully",
      data: mockBook,
    });
  });
});
