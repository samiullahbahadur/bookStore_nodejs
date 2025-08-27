import express from "express";
import db from "../models/index.js";
const { Order, Book, OrderItem, User } = db;
import path from "path";
import PDFDocument from "pdfkit";
import authenticate from "../middleware/auth.js";

const router = express.Router();
router.get("/:orderId/pdf", authenticate, async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      include: [{ model: User }, { model: OrderItem, include: [Book] }],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    const fontPath = path.join(process.cwd(), "fonts", "Vazirmatn-Regular.ttf");
    doc.registerFont("PersianFont", fontPath);
    doc.font("PersianFont");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.id}.pdf`
    );
    doc.pipe(res);

    // ===== HEADER =====
    doc.fontSize(24).text("Invoice", { align: "center" }).moveDown(2);

    // ===== Order Info =====
    doc
      .fontSize(12)
      .text(`Order ID: ${order.id}`)
      .text(`Customer Name: ${order.User?.name || "N/A"}`)
      .text(`Email: ${order.User?.email || "N/A"}`)
      .text(`Payment Status: ${order.paymentStatus || "N/A"}`)
      .text(`Payment Method: ${order.paymentMethod || "N/A"}`)
      .text(`Shipping Address: ${order.shippingAddress || "N/A"}`)
      .moveDown(2);

    // ===== Items Table =====
    doc.fontSize(14).text("Order Items", { underline: true }).moveDown(1);

    const tableTop = doc.y;
    const colWidths = [40, 200, 80, 80, 80];
    const headers = ["#", "Item", "Quantity", "Price", "Total"];

    // Function to draw a table row (with borders)
    const drawRow = (row, y) => {
      let x = 50;
      row.forEach((text, i) => {
        doc.rect(x, y, colWidths[i], 20).stroke();
        doc.text(text, x + 5, y + 5, {
          width: colWidths[i] - 10,
          align: i === 1 ? "left" : "center",
        });
        x += colWidths[i];
      });
    };

    // Draw header row
    drawRow(headers, tableTop);

    // Draw item rows
    let y = tableTop + 20;
    order.OrderItems.forEach((item, idx) => {
      const row = [
        idx + 1,
        item.Book?.title || "Unknown",
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.quantity).toFixed(2)}`,
      ];
      drawRow(row, y);
      y += 20;
    });

    // ===== TOTAL =====
    doc
      .moveDown(2)
      .fontSize(14)
      .text(`Grand Total: $${order.totalPrice.toFixed(2)}`, { align: "right" });

    // ===== FOOTER =====
    doc
      .moveDown(2)
      .fontSize(10)
      .text("Thank you for your purchase!", { align: "center" });

    doc.end();
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
