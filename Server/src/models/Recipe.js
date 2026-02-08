// src/models/Recipe.js
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

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    category: {
      type: String,
      required: true,
      trim: true,
      enum: ALLOWED_CATEGORIES,
    },

    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },

    prepTime: { type: Number, default: 0 },
    cookingTime: { type: Number, default: 0 },
    servings: { type: Number, default: 1 },
    calories: { type: Number, default: 0 },

    ingredients: { type: [String], default: [] },
    tools: { type: [String], default: [] },
    instructions: { type: [String], default: [] },

    nutrition: { type: String, default: "" },

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
recipeSchema.index({ name: "text", description: "text", ingredients: "text" });
recipeSchema.index({ category: 1 });
recipeSchema.index({ isVegetarian: 1, isVegan: 1, isGlutenFree: 1 });

module.exports = mongoose.model("Recipe", recipeSchema);
