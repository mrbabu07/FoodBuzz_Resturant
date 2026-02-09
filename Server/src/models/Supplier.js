// Server/src/models/Supplier.js
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
    },
    itemsSupplied: [
      {
        type: String,
      },
    ],
    paymentTerms: {
      type: String,
      enum: ["Cash", "Credit-7days", "Credit-15days", "Credit-30days"],
      default: "Cash",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  {
    timestamps: true,
  },
);

supplierSchema.index({ name: 1 });

module.exports = mongoose.model("Supplier", supplierSchema);
