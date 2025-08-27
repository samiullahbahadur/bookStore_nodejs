import { configureStore } from "@reduxjs/toolkit";
import booksReducer from "../pages/books/booksSlice";
import cartsReducer from "./cartSlice";
import orderReducer from "./orderSlice";
import authReducer from "../pages/authPage/authSlice";

export const store = configureStore({
  reducer: {
    books: booksReducer,
    cart: cartsReducer,
    orders: orderReducer,
    auth: authReducer,
  },
});
