// Server/src/models/Address.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: String,
    area: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: String,
    landmark: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    deliveryInstructions: String,
  },
  { timestamps: true },
);

// Ensure only one default address per user
addressSchema.pre("save", async function () {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false },
    );
  }
});

module.exports = mongoose.model("Address", addressSchema);
