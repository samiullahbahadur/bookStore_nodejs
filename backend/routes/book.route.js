import express from "express";
import authenticate from "../middleware/auth.js";
import isAdmin from "../middleware/Admin.js";
import upload from "../middleware/upload.js";
import validate from "../validators/validate.js";
import validateBook from "../validators/validdateBook.js";
import {
  getBooks,
  creatBooks,
  deleteBook,
  updateBook,
  getBookById,
} from "../controller/book.controller.js";

const route = express.Router();

route.get("/", getBooks);
route.get("/:id", getBookById);
route.post(
  "/register",

  authenticate,
  isAdmin,
  upload.single("photo"),
  validateBook,
  validate,
  creatBooks
);
route.put(
  "/:id",
  authenticate,
  isAdmin,
  upload.single("image"),
  validateBook,
  validate,
  updateBook
);

route.delete("/:id", authenticate, isAdmin, deleteBook);
export default route;
