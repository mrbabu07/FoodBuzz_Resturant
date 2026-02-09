// Server/src/routes/inventory.routes.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const {
  // Ingredients
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getLowStockIngredients,

  // Suppliers
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,

  // Purchases
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchaseStatus,

  // Stock Adjustments
  getAllAdjustments,
  createAdjustment,
  approveAdjustment,

  // Recipe Ingredients
  getRecipeIngredients,
  saveRecipeIngredients,
  calculateFoodCost,

  // Dashboard
  getInventoryStats,
} = require("../controllers/inventory.controller");

// ==================== INGREDIENTS ====================
router.get("/ingredients", auth, getAllIngredients);
router.get("/ingredients/low-stock", auth, getLowStockIngredients);
router.get("/ingredients/:id", auth, getIngredientById);
router.post(
  "/ingredients",
  auth,
  allowRoles("admin", "staff"),
  createIngredient,
);
router.put(
  "/ingredients/:id",
  auth,
  allowRoles("admin", "staff"),
  updateIngredient,
);
router.delete("/ingredients/:id", auth, allowRoles("admin"), deleteIngredient);

// ==================== SUPPLIERS ====================
router.get("/suppliers", auth, getAllSuppliers);
router.post("/suppliers", auth, allowRoles("admin", "staff"), createSupplier);
router.put(
  "/suppliers/:id",
  auth,
  allowRoles("admin", "staff"),
  updateSupplier,
);
router.delete("/suppliers/:id", auth, allowRoles("admin"), deleteSupplier);

// ==================== PURCHASES ====================
router.get("/purchases", auth, getAllPurchases);
router.get("/purchases/:id", auth, getPurchaseById);
router.post("/purchases", auth, allowRoles("admin", "staff"), createPurchase);
router.patch(
  "/purchases/:id/status",
  auth,
  allowRoles("admin", "staff"),
  updatePurchaseStatus,
);

// ==================== STOCK ADJUSTMENTS ====================
router.get("/adjustments", auth, getAllAdjustments);
router.post(
  "/adjustments",
  auth,
  allowRoles("admin", "staff"),
  createAdjustment,
);
router.patch(
  "/adjustments/:id/approve",
  auth,
  allowRoles("admin"),
  approveAdjustment,
);

// ==================== RECIPE INGREDIENTS ====================
router.get("/recipes/:menuItemId", auth, getRecipeIngredients);
router.post(
  "/recipes",
  auth,
  allowRoles("admin", "staff"),
  saveRecipeIngredients,
);
router.get("/recipes/:menuItemId/food-cost", auth, calculateFoodCost);

// ==================== DASHBOARD ====================
router.get("/stats", auth, getInventoryStats);

module.exports = router;
