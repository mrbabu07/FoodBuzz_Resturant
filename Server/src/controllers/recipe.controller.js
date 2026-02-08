// src/controllers/recipe.controller.js
const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const notificationService = require("../utils/notificationService");

const ALLOWED_CATEGORIES = [
  "Chicken",
  "Beef",
  "Fish",
  "Soup",
  "Dessert",
  "Drink",
];

// GET /api/recipes?q=&category=
exports.getAllRecipes = async (req, res) => {
  try {
    const { q, category } = req.query;
    const filter = {};

    if (category && category !== "All") {
      const cat = String(category).trim();
      if (!ALLOWED_CATEGORIES.includes(cat)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      filter.category = cat;
    }

    if (q) {
      const regex = new RegExp(String(q).trim(), "i");
      filter.$or = [
        { name: regex },
        { category: regex },
        { description: regex },
        { ingredients: { $elemMatch: { $regex: regex } } },
      ];
    }

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
    return res.json(recipes);
  } catch (err) {
    console.error("getAllRecipes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recipes/:id
exports.getRecipeById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    return res.json(recipe);
  } catch (err) {
    console.error("getRecipeById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/recipes  (admin/staff)
exports.createRecipe = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      imageUrl,
      pic,
      prepTime,
      cookingTime,
      servings,
      calories,
      ingredients,
      tools,
      instructions,
      steps,
      nutrition,
    } = req.body;

    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "name and category are required" });
    }

    const cat = String(category).trim();
    if (!ALLOWED_CATEGORIES.includes(cat)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const recipe = await Recipe.create({
      name: String(name).trim(),
      category: cat,
      description: description ? String(description).trim() : "",
      imageUrl: imageUrl || pic ? String(imageUrl || pic).trim() : "",

      prepTime: Number(prepTime || 0),
      cookingTime: Number(cookingTime || 0),
      servings: Number(servings || 1),
      calories: Number(calories || 0),

      ingredients: Array.isArray(ingredients) ? ingredients : [],
      tools: Array.isArray(tools) ? tools : [],

      instructions: Array.isArray(instructions)
        ? instructions
        : Array.isArray(steps)
          ? steps
          : [],

      nutrition: nutrition ? String(nutrition).trim() : "",
    });

    // 🔔 Send notification to users who opted in for recipe notifications
    try {
      // Get users who want recipe/promo notifications
      const users = await User.find({
        "notificationPrefs.promoEmails": true,
      }).select("_id");

      if (users.length > 0) {
        const userIds = users.map((u) => u._id);

        // Send bulk notification (async, don't wait)
        notificationService
          .sendBulkNotification(userIds, {
            type: "recipe",
            title: "🍽️ New Recipe Added!",
            message: `Check out our new recipe: ${recipe.name}`,
            data: {
              recipeId: recipe._id,
              recipeName: recipe.name,
              category: recipe.category,
            },
            priority: "low",
          })
          .catch((err) => {
            console.error("Failed to send bulk recipe notifications:", err);
          });

        console.log(`📢 Sending recipe notification to ${users.length} users`);
      }
    } catch (notifError) {
      console.error("Failed to send recipe notifications:", notifError);
      // Don't fail recipe creation if notification fails
    }

    return res.status(201).json({ message: "Recipe created", recipe });
  } catch (err) {
    console.error("createRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/recipes/:id  (admin/staff)
exports.updateRecipe = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    const payload = { ...req.body };

    // যদি old frontend price পাঠায়, ignore
    if (payload.price !== undefined) delete payload.price;

    if (payload.name) payload.name = String(payload.name).trim();

    if (payload.category) {
      payload.category = String(payload.category).trim();
      if (!ALLOWED_CATEGORIES.includes(payload.category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    if (payload.description !== undefined)
      payload.description = String(payload.description).trim();

    if (payload.pic && !payload.imageUrl) payload.imageUrl = payload.pic;
    if (payload.imageUrl !== undefined)
      payload.imageUrl = String(payload.imageUrl).trim();

    if (Array.isArray(payload.steps) && !Array.isArray(payload.instructions)) {
      payload.instructions = payload.steps;
      delete payload.steps;
    }

    if (payload.ingredients !== undefined)
      payload.ingredients = Array.isArray(payload.ingredients)
        ? payload.ingredients
        : [];
    if (payload.tools !== undefined)
      payload.tools = Array.isArray(payload.tools) ? payload.tools : [];
    if (payload.instructions !== undefined)
      payload.instructions = Array.isArray(payload.instructions)
        ? payload.instructions
        : [];

    if (payload.prepTime !== undefined)
      payload.prepTime = Number(payload.prepTime || 0);
    if (payload.cookingTime !== undefined)
      payload.cookingTime = Number(payload.cookingTime || 0);
    if (payload.servings !== undefined)
      payload.servings = Number(payload.servings || 1);
    if (payload.calories !== undefined)
      payload.calories = Number(payload.calories || 0);

    if (payload.nutrition !== undefined)
      payload.nutrition = String(payload.nutrition || "").trim();

    const recipe = await Recipe.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    return res.json({ message: "Recipe updated", recipe });
  } catch (err) {
    console.error("updateRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/recipes/:id  (admin only)
exports.deleteRecipe = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }

    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    return res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error("deleteRecipe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recipes/trending - Get trending/popular recipes
exports.getTrendingRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get random recipes (you can enhance this with view counts, ratings, etc.)
    const recipes = await Recipe.aggregate([{ $sample: { size: limit } }]);

    return res.json(recipes);
  } catch (err) {
    console.error("getTrendingRecipes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recipes/recent - Get recently added recipes
exports.getRecentRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(limit);

    return res.json(recipes);
  } catch (err) {
    console.error("getRecentRecipes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
