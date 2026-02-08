const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");
const Order = require("../models/Order");

function makeInvoiceNo(orderId) {
  return "INV-" + String(orderId).slice(-6).toUpperCase();
}

// GET /api/orders/:id/receipt/pdf  (owner or staff/admin)
exports.downloadReceiptPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ permission
    const me = req.user;
    const isOwner = String(order.userId) === String(me.id);
    const isStaffOrAdmin = me.role === "staff" || me.role === "admin";

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ✅ Allow receipts for completed/delivered orders and orders in progress
    const allowedStatuses = ["Delivered", "Ready", "Processing"];
    if (!allowedStatuses.includes(order.status)) {
      return res
        .status(400)
        .json({
          message:
            "Receipt available only for orders that are Processing, Ready, or Delivered",
        });
    }

    const invoiceNo = makeInvoiceNo(order._id);

    // ✅ headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoiceNo}.pdf"`,
    );

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    // ===== PDF DESIGN =====
    doc.fontSize(20).text("ROMS - Receipt / Invoice", { align: "center" });
    doc.moveDown(0.6);
    doc.fontSize(12).text(`Invoice No: ${invoiceNo}`);
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Issued At: ${new Date().toLocaleString()}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown(0.6);

    doc.fontSize(12).text("Delivery Info", { underline: true });
    doc.moveDown(0.2);
    doc.text(`Address: ${order.deliveryAddress || "-"}`);
    doc.text(`Phone: ${order.phone || "-"}`);
    doc.text(`Payment: ${order.paymentMethod || "COD"}`);
    doc.moveDown(0.8);

    // items table header
    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.4);

    const startX = 50;
    let y = doc.y;

    // column widths
    const colName = 260;
    const colQty = 60;
    const colPrice = 80;
    const colTotal = 80;

    doc.font("Helvetica-Bold");
    doc.text("Name", startX, y, { width: colName });
    doc.text("Qty", startX + colName, y, { width: colQty, align: "right" });
    doc.text("Price", startX + colName + colQty, y, {
      width: colPrice,
      align: "right",
    });
    doc.text("Total", startX + colName + colQty + colPrice, y, {
      width: colTotal,
      align: "right",
    });

    doc.moveDown(0.3);
    doc.font("Helvetica");
    y = doc.y;

    const items = Array.isArray(order.items) ? order.items : [];
    for (const it of items) {
      const lineTotal = Number(it.price || 0) * Number(it.qty || 1);

      // page break safety
      if (doc.y > 720) {
        doc.addPage();
        y = doc.y;
      }

      doc.text(String(it.name || "-"), startX, y, { width: colName });
      doc.text(String(it.qty || 1), startX + colName, y, {
        width: colQty,
        align: "right",
      });
      doc.text(String(it.price || 0), startX + colName + colQty, y, {
        width: colPrice,
        align: "right",
      });
      doc.text(String(lineTotal), startX + colName + colQty + colPrice, y, {
        width: colTotal,
        align: "right",
      });

      doc.moveDown(0.25);
      y = doc.y;
    }

    doc.moveDown(0.8);
    doc.font("Helvetica-Bold");
    doc.text(`Subtotal: ${order.subtotal || 0} BDT`, { align: "right" });
    doc.text(`Delivery Fee: ${order.deliveryFee || 0} BDT`, { align: "right" });
    doc.text(`Total: ${order.total || 0} BDT`, { align: "right" });

    doc.moveDown(1.2);
    doc
      .font("Helvetica")
      .fontSize(10)
      .text("Thank you for ordering from ROMS!", {
        align: "center",
      });

    doc.end();
  } catch (err) {
    console.error("downloadReceiptPdf error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
