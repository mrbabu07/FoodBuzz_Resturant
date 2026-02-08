const mongoose = require("mongoose");

const notificationPrefsSchema = new mongoose.Schema(
  {
    orderEmails: { type: Boolean, default: true },
    statusEmails: { type: Boolean, default: true },
    promoEmails: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: false },
    smsNotifications: { type: Boolean, default: false },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "staff", "user"],
      default: "user",
    },

    address: { type: String, default: "" },

    phone: { type: String, default: "" },

    isActive: { type: Boolean, default: true },

    // ✅ FIXED & CONSISTENT
    notificationPrefs: {
      type: notificationPrefsSchema,
      default: () => ({}),
    },

    // Push notification subscription
    pushSubscription: {
      endpoint: { type: String },
      keys: {
        p256dh: { type: String },
        auth: { type: String },
      },
    },

    // Password reset fields
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Email verification fields
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },

    // ✅ NEW: Favorites and Wishlist
    favoriteRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],

    wishlistItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],

    // Dietary restrictions (for personalized recommendations)
    dietaryRestrictions: {
      type: [String],
      enum: [
        "Vegetarian",
        "Vegan",
        "Gluten-Free",
        "Halal",
        "Dairy-Free",
        "Nut-Free",
      ],
      default: [],
    },

    // Allergen alerts
    allergenAlerts: {
      type: [String],
      enum: [
        "Dairy",
        "Eggs",
        "Fish",
        "Shellfish",
        "Tree Nuts",
        "Peanuts",
        "Wheat",
        "Soy",
        "Sesame",
        "Gluten",
      ],
      default: [],
    },
  },
  { timestamps: true },
);

// Index for better query performance
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model("User", userSchema);
