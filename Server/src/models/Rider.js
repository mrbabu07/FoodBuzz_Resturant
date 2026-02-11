// Server/src/models/Rider.js
const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "bicycle", "car"],
      default: "bike",
    },
    vehicleNumber: {
      type: String,
      required: true,
    },
    licenseNumber: String,
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "offline",
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },
    deliveryZones: [
      {
        type: String, // Area names like "Chittagong", "Dhaka North", etc.
      },
    ],
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    activeDeliveries: {
      type: Number,
      default: 0,
    },
    earnings: {
      today: { type: Number, default: 0 },
      thisWeek: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Rider", riderSchema);
