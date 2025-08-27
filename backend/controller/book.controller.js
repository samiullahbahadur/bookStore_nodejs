import db from "../models/index.js";
import fs from "fs";
import path from "path";
const { Book } = db;

export const getBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.status(201).json(books);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const creatBooks = async (req, res) => {
  try {
    const { title, description, price, author, stock } = req.body;
    const photo = req.file ? req.file.path : null;
    const userId = req.user.id;
    const newBook = await Book.create({
      title,
      description,
      price,
      photo,
      author,
      stock,
      userId,
    });
    res.status(201).json(newBook);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    if (book.photo) {
      const imagePath = path.join("uploads", path.basename(book.photo));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await book.destroy();
    res.status(201).json({ id: bookId, message: "Book deleted SuccessFully " });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, description, price, author, stock } = req.body;

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (req.file) {
      if (book.photo) {
        const oldPath = path.join("uploads", path.basename(book.photo));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Remove old image
        }
      }

      book.photo = req.file.filename; // add new image
    }

    book.title = title || book.title;
    book.description = description || book.description;
    book.price = price || book.price;
    (book.stock = stock || book.stock), (book.author = author || book.author);

    await book.save();

    res.status(200).json({ message: "Book updated successfully", book });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
