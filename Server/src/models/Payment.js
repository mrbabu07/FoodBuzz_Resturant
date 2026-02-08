// Payment Model
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ["stripe", "cash", "bkash", "nagad"],
      required: true,
    },

    // Payment status
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "pending",
    },

    // Amount details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "BDT", // Bangladesh Taka
    },

    // Stripe specific fields
    stripeSessionId: {
      type: String,
      sparse: true, // Allow null but unique if present
    },

    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },

    stripeChargeId: {
      type: String,
      sparse: true,
    },

    // Mobile payment specific fields (bKash, Nagad)
    transactionId: {
      type: String,
      sparse: true,
    },

    phoneNumber: {
      type: String,
    },

    // Payment metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Refund information
    refundAmount: {
      type: Number,
      default: 0,
    },

    refundReason: {
      type: String,
    },

    refundedAt: {
      type: Date,
    },

    // Payment timestamps
    paidAt: {
      type: Date,
    },

    failedAt: {
      type: Date,
    },

    // Error information
    errorMessage: {
      type: String,
    },

    errorCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
