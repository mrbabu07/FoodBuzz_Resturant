// Server/src/models/RecipeIngredient.js
const mongoose = require("mongoose");

const recipeIngredientSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    ingredients: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        unit: {
          type: String,
          required: true,
        },
        cost: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalFoodCost: {
      type: Number,
      default: 0,
    },
    foodCostPercentage: {
      type: Number,
      default: 0,
    },
    prepTime: {
      type: Number, // in minutes
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Calculate total food cost
recipeIngredientSchema.methods.calculateFoodCost = async function () {
  let total = 0;
  for (const item of this.ingredients) {
    const Ingredient = mongoose.model("Ingredient");
    const ingredient = await Ingredient.findById(item.ingredient);
    if (ingredient) {
      item.cost = ingredient.purchasePrice * item.quantity;
      total += item.cost;
    }
  }
  this.totalFoodCost = total;

  // Calculate food cost percentage if menu item price is available
  const MenuItem = mongoose.model("MenuItem");
  const menuItem = await MenuItem.findById(this.menuItem);
  if (menuItem && menuItem.price) {
    this.foodCostPercentage = (total / menuItem.price) * 100;
  }

  return total;
};

recipeIngredientSchema.index({ menuItem: 1 });

module.exports = mongoose.model("RecipeIngredient", recipeIngredientSchema);
