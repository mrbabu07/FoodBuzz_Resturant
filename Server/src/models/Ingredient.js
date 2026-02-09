// Server/src/models/Ingredient.js
const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Raw Materials",
        "Spices",
        "Beverages",
        "Packaging",
        "Dairy",
        "Vegetables",
        "Meat",
        "Seafood",
        "Other",
      ],
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "gm", "liter", "ml", "pieces", "dozen"],
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maxStock: {
      type: Number,
      default: null,
    },
    purchasePrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    expiryDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual for stock status
ingredientSchema.virtual("stockStatus").get(function () {
  if (this.currentStock <= 0) return "out-of-stock";
  if (this.currentStock <= this.minStock) return "low-stock";
  if (this.maxStock && this.currentStock >= this.maxStock) return "overstock";
  return "in-stock";
});

// Index for faster queries
ingredientSchema.index({ name: 1 });
ingredientSchema.index({ category: 1 });
ingredientSchema.index({ currentStock: 1 });

module.exports = mongoose.model("Ingredient", ingredientSchema);
