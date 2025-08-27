// import db from "../models/index.js";
// const { Book } = db;

// export const inventory = async (req, res) => {
//   try {
//     const { stock } = req.body;
//     const { bookId } = req.params;
//     const book = await Book.findByPk(bookId);
//     if (!book) return res.status(404).json({ message: "book not found" });
//     book.stock = stock;
//     await book.save();
//     res.status(200).json({ message: "Stock updated", book });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
