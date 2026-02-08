const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");

const {
  getFavoriteRecipes,
  addFavoriteRecipe,
  removeFavoriteRecipe,
  checkFavoriteRecipe,
  getWishlistItems,
  addWishlistItem,
  removeWishlistItem,
  checkWishlistItem,
} = require("../controllers/favorites.controller");

// ==================== FAVORITE RECIPES ====================

// Get all favorite recipes
router.get(
  "/recipes",
  auth,
  allowRoles("user", "admin", "staff"),
  getFavoriteRecipes,
);

// Add recipe to favorites
router.post(
  "/recipes/:id",
  auth,
  allowRoles("user", "admin", "staff"),
  addFavoriteRecipe,
);

// Remove recipe from favorites
router.delete(
  "/recipes/:id",
  auth,
  allowRoles("user", "admin", "staff"),
  removeFavoriteRecipe,
);

// Check if recipe is favorited
router.get(
  "/recipes/check/:id",
  auth,
  allowRoles("user", "admin", "staff"),
  checkFavoriteRecipe,
);

// ==================== WISHLIST MENU ITEMS ====================

// Get all wishlist menu items
router.get(
  "/menu-items",
  auth,
  allowRoles("user", "admin", "staff"),
  getWishlistItems,
);

// Add menu item to wishlist
router.post(
  "/menu-items/:id",
  auth,
  allowRoles("user", "admin", "staff"),
  addWishlistItem,
);

// Remove menu item from wishlist
router.delete(
  "/menu-items/:id",
  auth,
  allowRoles("user", "admin", "staff"),
  removeWishlistItem,
);

// Check if menu item is in wishlist
router.get(
  "/menu-items/check/:id",
  auth,
  allowRoles("user", "admin", "staff"),
  checkWishlistItem,
);

module.exports = router;
