// Server/src/models/StockAdjustment.js
const mongoose = require("mongoose");

const stockAdjustmentSchema = new mongoose.Schema(
  {
    adjustmentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Wastage",
        "Spoilage",
        "Theft",
        "Damage",
        "Adjustment",
        "Return",
        "Transfer",
      ],
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate adjustment number
stockAdjustmentSchema.pre("save", async function (next) {
  if (!this.adjustmentNumber) {
    const count = await mongoose.model("StockAdjustment").countDocuments();
    this.adjustmentNumber = `ADJ-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

stockAdjustmentSchema.index({ adjustmentNumber: 1 });
stockAdjustmentSchema.index({ ingredient: 1 });
stockAdjustmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("StockAdjustment", stockAdjustmentSchema);
