//path: backend_sara/roms-backend/src/models/MenuItem.js
const mongoose = require("mongoose");

const ALLOWED_CATEGORIES = [
  "Chicken",
  "Beef",
  "Fish",
  "Soup",
  "Dessert",
  "Drink",
  "Pizza",
  "Pasta",
  "Salad",
  "Rice",
  "Sandwich",
  "Appetizer",
  "Vegetarian",
];

const COMMON_ALLERGENS = [
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
];

const menuItemSchema = new mongoose.Schema(
  {
    // optional: recipeId link (চাইলে রাখবে)
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      default: null,
    },

    name: { type: String, required: true, trim: true },

    category: {
      type: String,
      required: true,
      trim: true,
      enum: ALLOWED_CATEGORIES,
    },

    imageUrl: { type: String, default: "" },
    details: { type: String, default: "" },
    calories: { type: Number, default: 0 },

    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },

    // ✅ NEW: Allergen and dietary information (CRITICAL FOR SAFETY)
    allergens: {
      type: [String],
      enum: COMMON_ALLERGENS,
      default: [],
    },

    // Dietary preferences
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isHalal: { type: Boolean, default: false },
    isDairyFree: { type: Boolean, default: false },
    isNutFree: { type: Boolean, default: false },

    // Spice level
    spiceLevel: {
      type: String,
      enum: ["None", "Mild", "Medium", "Hot", "Extra Hot"],
      default: "None",
    },
  },
  { timestamps: true },
);

// Index for better search performance
menuItemSchema.index({ name: "text", details: "text" });
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ price: 1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);
