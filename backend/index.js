import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/user.route.js";
import bookRoutes from "./routes/book.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";
import invoiceRoutes from "./routes/invoice.router.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    // methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);




app.use("/uploads", express.static("uploads"));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

app.use("/users", userRoutes);
app.use("/books", bookRoutes);
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/invoice", invoiceRoutes);

// app.listen(5000, () => {
//   console.log("Server is running");
// });

export default app;
