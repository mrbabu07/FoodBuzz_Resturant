// src/routes/recipe.routes.js
const router = require("express").Router();

const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");

const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getTrendingRecipes,
  getRecentRecipes,
} = require("../controllers/recipe.controller");

router.get("/", getAllRecipes);
router.get("/trending", getTrendingRecipes);
router.get("/recent", getRecentRecipes);
router.get("/:id", getRecipeById);

router.post("/", auth, allowRoles("admin", "staff"), createRecipe);
router.put("/:id", auth, allowRoles("admin", "staff"), updateRecipe);

router.delete("/:id", auth, allowRoles("admin"), deleteRecipe);

module.exports = router;
