const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "bogo", "free_delivery"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: function () {
        return (
          this.discountType === "percentage" || this.discountType === "fixed"
        );
      },
    },
    minimumOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number, // For percentage discounts
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showAsModal: {
      type: Boolean,
      default: true, // Show in login modal
    },
    imageUrl: {
      type: String,
    },
    backgroundColor: {
      type: String,
      default: "#f97316", // Orange color
    },
    textColor: {
      type: String,
      default: "#ffffff", // White text
    },
    buttonText: {
      type: String,
      default: "Claim Offer",
    },
    usageLimit: {
      type: Number, // Max times this offer can be used
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    applicableCategories: [String], // Menu categories this applies to
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for active offers
offerSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

// Virtual for checking if offer is currently valid
offerSchema.virtual("isCurrentlyValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validUntil >= now &&
    (!this.usageLimit || this.usageCount < this.usageLimit)
  );
});

// Method to check if offer is applicable to an order
offerSchema.methods.isApplicableToOrder = function (
  orderAmount,
  categories = [],
) {
  if (!this.isCurrentlyValid) return false;
  if (orderAmount < this.minimumOrderAmount) return false;

  // Check category restrictions
  if (this.applicableCategories.length > 0) {
    const hasApplicableCategory = categories.some((cat) =>
      this.applicableCategories.includes(cat),
    );
    if (!hasApplicableCategory) return false;
  }

  return true;
};

// Method to calculate discount amount
offerSchema.methods.calculateDiscount = function (orderAmount) {
  if (!this.isApplicableToOrder(orderAmount)) return 0;

  let discount = 0;

  switch (this.discountType) {
    case "percentage":
      discount = (orderAmount * this.discountValue) / 100;
      if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
        discount = this.maxDiscountAmount;
      }
      break;
    case "fixed":
      discount = Math.min(this.discountValue, orderAmount);
      break;
    case "free_delivery":
      discount = 5; // Assuming $5 delivery fee
      break;
    case "bogo":
      // Buy one get one - would need more complex logic based on items
      discount = 0; // Placeholder
      break;
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model("Offer", offerSchema);
