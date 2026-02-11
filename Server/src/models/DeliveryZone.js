// Server/src/models/DeliveryZone.js
const mongoose = require("mongoose");

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    areas: [
      {
        type: String, // Sub-areas within the zone
      },
    ],
    deliveryFee: {
      type: Number,
      required: true,
      default: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    estimatedDeliveryTime: {
      type: Number, // in minutes
      default: 30,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    coordinates: {
      // For map-based zone definition
      type: {
        type: String,
        enum: ["Polygon"],
        default: "Polygon",
      },
      coordinates: [[[Number]]], // GeoJSON format
    },
  },
  { timestamps: true },
);

// Index for geospatial queries
deliveryZoneSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("DeliveryZone", deliveryZoneSchema);
