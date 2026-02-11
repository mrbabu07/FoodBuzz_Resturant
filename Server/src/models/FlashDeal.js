const mongoose = require("mongoose");

const flashDealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    dealPrice: {
      type: Number,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    maxQuantity: {
      type: Number,
      default: null, // null means unlimited
    },
    soldQuantity: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    conversionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Index for efficient queries
flashDealSchema.index({ startTime: 1, endTime: 1, isActive: 1 });
flashDealSchema.index({ menuItemId: 1 });

// Virtual for remaining quantity
flashDealSchema.virtual("remainingQuantity").get(function () {
  if (this.maxQuantity === null) return null;
  return Math.max(0, this.maxQuantity - this.soldQuantity);
});

// Virtual for deal status
flashDealSchema.virtual("status").get(function () {
  const now = new Date();
  if (!this.isActive) return "inactive";
  if (now < this.startTime) return "upcoming";
  if (now > this.endTime) return "expired";
  if (this.maxQuantity && this.soldQuantity >= this.maxQuantity)
    return "sold_out";
  return "active";
});

// Method to check if deal is available
flashDealSchema.methods.isAvailable = function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startTime &&
    now <= this.endTime &&
    (this.maxQuantity === null || this.soldQuantity < this.maxQuantity)
  );
};

flashDealSchema.set("toJSON", { virtuals: true });
flashDealSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("FlashDeal", flashDealSchema);
