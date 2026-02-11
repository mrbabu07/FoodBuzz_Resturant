const mongoose = require("mongoose");

const promoBannerSchema = new mongoose.Schema(
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
    imageUrl: {
      type: String,
      required: true,
    },
    linkUrl: {
      type: String,
      trim: true,
    },
    linkType: {
      type: String,
      enum: ["offer", "category", "menu", "external", "none"],
      default: "none",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0, // Higher priority shows first
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    impressionCount: {
      type: Number,
      default: 0,
    },
    targetAudience: {
      type: String,
      enum: ["all", "new", "returning", "vip"],
      default: "all",
    },
  },
  { timestamps: true },
);

// Index for efficient queries
promoBannerSchema.index({ startDate: 1, endDate: 1, isActive: 1 });
promoBannerSchema.index({ priority: -1 });

// Method to check if banner is currently active
promoBannerSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

module.exports = mongoose.model("PromoBanner", promoBannerSchema);
