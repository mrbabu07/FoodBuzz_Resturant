//path: backend_sara/roms-backend/src/models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    price: { type: Number, default: 0 }, // snapshot at order time
    qty: { type: Number, default: 1 },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: { type: [orderItemSchema], default: [] },

    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    paymentMethod: {
      type: String,
      enum: ["COD", "Stripe", "stripe", "bkash", "nagad", "cash"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    deliveryAddress: { type: String, default: "" },
    phone: { type: String, default: "" },
    notes: { type: String, default: "" },

    // Order scheduling
    scheduledFor: { type: Date, default: null },
    isScheduled: { type: Boolean, default: false },

    status: { type: String, default: "Placed" },
    statusHistory: {
      type: [statusHistorySchema],
      default: [{ status: "Placed", at: new Date() }],
    },
  },
  { timestamps: true },
);

// Index for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);
