const User = require("../models/User");
const Recipe = require("../models/Recipe");
const MenuItem = require("../models/MenuItem");
const mongoose = require("mongoose");

/**
 * Favorites Controller
 * Handles favorite recipes and wishlist menu items
 */

// ==================== FAVORITE RECIPES ====================

// GET /api/favorites/recipes - Get user's favorite recipes
exports.getFavoriteRecipes = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "favoriteRecipes",
      select:
        "name description imageUrl pic category prepTime cookingTime servings calories",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user.favoriteRecipes || []);
  } catch (err) {
    console.error("getFavoriteRecipes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/favorites/recipes/:id - Add recipe to favorites
exports.addFavoriteRecipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Add to favorites (using $addToSet to avoid duplicates)
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteRecipes: id } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Recipe added to favorites",
      favoriteRecipes: user.favoriteRecipes,
    });
  } catch (err) {
    console.error("addFavoriteRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/favorites/recipes/:id - Remove recipe from favorites
exports.removeFavoriteRecipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    // Remove from favorites
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteRecipes: id } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Recipe removed from favorites",
      favoriteRecipes: user.favoriteRecipes,
    });
  } catch (err) {
    console.error("removeFavoriteRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/favorites/recipes/check/:id - Check if recipe is favorited
exports.checkFavoriteRecipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorite = user.favoriteRecipes.some(
      (recipeId) => String(recipeId) === String(id),
    );

    return res.json({ isFavorite });
  } catch (err) {
    console.error("checkFavoriteRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================== WISHLIST MENU ITEMS ====================

// GET /api/favorites/menu-items - Get user's wishlist menu items
exports.getWishlistItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "wishlistItems",
      select: "name details imageUrl pic category price calories isAvailable",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user.wishlistItems || []);
  } catch (err) {
    console.error("getWishlistItems error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/favorites/menu-items/:id - Add menu item to wishlist
exports.addWishlistItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }

    // Check if menu item exists
    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Add to wishlist (using $addToSet to avoid duplicates)
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlistItems: id } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Menu item added to wishlist",
      wishlistItems: user.wishlistItems,
    });
  } catch (err) {
    console.error("addWishlistItem error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/favorites/menu-items/:id - Remove menu item from wishlist
exports.removeWishlistItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }

    // Remove from wishlist
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlistItems: id } },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Menu item removed from wishlist",
      wishlistItems: user.wishlistItems,
    });
  } catch (err) {
    console.error("removeWishlistItem error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/favorites/menu-items/check/:id - Check if menu item is in wishlist
exports.checkWishlistItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isInWishlist = user.wishlistItems.some(
      (itemId) => String(itemId) === String(id),
    );

    return res.json({ isInWishlist });
  } catch (err) {
    console.error("checkWishlistItem error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
