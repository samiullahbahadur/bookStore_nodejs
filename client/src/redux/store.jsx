import { configureStore } from "@reduxjs/toolkit";
import booksReducer from "../pages/books/booksSlice";
import cartsReducer from "./cartSlice";
import orderReducer from "./orderSlice";
import authReducer from "../pages/authPage/authSlice";
import notificationsReducer from "./notificationSlice";

export const store = configureStore({
  reducer: {
    books: booksReducer,
    cart: cartsReducer,
    orders: orderReducer,
    auth: authReducer,
    notifications: notificationsReducer, // ✅ important
  },
});
