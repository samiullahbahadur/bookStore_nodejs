import PDFDocument from "pdfkit";
import db from "../models/index.js";

const { Order, OrderItem, Book, User } = db;

export const generateInvoice = async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized msg from invoice controller" });
    }

    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [{ model: User }, { model: OrderItem, include: [Book] }],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create PDF
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.id}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(20).text("Invoice", { align: "center" }).moveDown();

    // Order Info
    doc.fontSize(12).text(`Order ID: ${order.id}`);
    doc.text(`Customer: ${order.User.name}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.text(`Shipping Address: ${order.shippingAddress}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.moveDown();

    // Items
    doc.text("Items:", { underline: true });
    order.OrderItems.forEach((item) => {
      doc.text(
        `${item.Book.title} x ${item.quantity} = $${item.price * item.quantity}`
      );
    });

    doc.moveDown();
    doc.text(`Total: $${order.totalPrice}`, { bold: true });

    doc.end();
  } catch (error) {
    console.error("Invoice generation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default  generateInvoice;