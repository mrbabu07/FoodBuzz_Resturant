const mongoose = require("mongoose");

const notificationPrefsSchema = new mongoose.Schema(
  {
    orderEmails: { type: Boolean, default: true },
    statusEmails: { type: Boolean, default: true },
    promoEmails: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: false },
    smsNotifications: { type: Boolean, default: false },

    // Quiet Hours (Do Not Disturb)
    quietHoursEnabled: { type: Boolean, default: false },
    quietHoursStart: { type: String, default: "22:00" }, // 10 PM
    quietHoursEnd: { type: String, default: "08:00" }, // 8 AM
    quietHoursWeekendOnly: { type: Boolean, default: false },

    // Notification Frequency
    notificationFrequency: {
      type: String,
      enum: ["instant", "hourly", "daily", "weekly"],
      default: "instant",
    },
    digestTime: { type: String, default: "09:00" }, // For daily/weekly digests

    // Advanced Settings
    soundEnabled: { type: Boolean, default: true },
    vibrationEnabled: { type: Boolean, default: true },
    showPreview: { type: Boolean, default: true },
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

    // ✅ Loyalty Points System
    loyaltyPoints: {
      balance: { type: Number, default: 0, min: 0 },
      totalEarned: { type: Number, default: 0, min: 0 },
      totalRedeemed: { type: Number, default: 0, min: 0 },
      tier: {
        type: String,
        enum: ["bronze", "silver", "gold", "platinum"],
        default: "bronze",
      },
      lastUpdated: { type: Date, default: Date.now },
    },

    // ✅ Referral System
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referralStats: {
      totalReferrals: { type: Number, default: 0 },
      successfulReferrals: { type: Number, default: 0 },
      rewardsEarned: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// Index for better query performance
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ referredBy: 1 });

// Generate unique referral code before saving (only for new users)
userSchema.pre("save", async function () {
  // Only generate for new user documents that don't have a code
  if (this.isNew && !this.referralCode && this.role === "user") {
    try {
      this.referralCode = await generateUniqueReferralCode();
    } catch (error) {
      console.error("Failed to generate referral code:", error);
      // Continue without referral code - can be generated later
    }
  }
});

// Helper function to generate unique referral code
async function generateUniqueReferralCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const existing = await mongoose
      .model("User")
      .findOne({ referralCode: code });
    if (!existing) isUnique = true;
  }

  return code;
}

// Method to update loyalty tier based on total earned points
userSchema.methods.updateLoyaltyTier = function () {
  const totalEarned = this.loyaltyPoints.totalEarned;

  if (totalEarned >= 10000) {
    this.loyaltyPoints.tier = "platinum";
  } else if (totalEarned >= 5000) {
    this.loyaltyPoints.tier = "gold";
  } else if (totalEarned >= 2000) {
    this.loyaltyPoints.tier = "silver";
  } else {
    this.loyaltyPoints.tier = "bronze";
  }
};

module.exports = mongoose.model("User", userSchema);
