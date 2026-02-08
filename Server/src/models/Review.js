//path: backend\backend_sara\roms-backend\src\models\Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // For recipe reviews
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },

    // For menu item reviews (order-based)
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    menuItemId: { type: mongoose.Schema.Types.ObjectId },
    menuItemName: { type: String },

    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
  },
  { timestamps: true },
);

// Index for faster queries
reviewSchema.index({ userId: 1, orderId: 1, menuItemId: 1 });
reviewSchema.index({ menuItemId: 1 });
reviewSchema.index({ recipeId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
