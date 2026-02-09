// Server/src/controllers/inventory.controller.js
const Ingredient = require("../models/Ingredient");
const Purchase = require("../models/Purchase");
const Supplier = require("../models/Supplier");
const StockAdjustment = require("../models/StockAdjustment");
const RecipeIngredient = require("../models/RecipeIngredient");
const { logActivity } = require("../utils/activityLogger");

// ==================== INGREDIENTS ====================

// Get all ingredients
exports.getAllIngredients = async (req, res) => {
  try {
    const { category, status } = req.query;

    let query = {};
    if (category) query.category = category;
    if (status === "low-stock") {
      query.$expr = { $lte: ["$currentStock", "$minStock"] };
    } else if (status === "out-of-stock") {
      query.currentStock = 0;
    }

    const ingredients = await Ingredient.find(query)
      .populate("supplier", "name phone")
      .sort({ name: 1 });

    res.json(ingredients);
  } catch (err) {
    console.error("Get ingredients error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get ingredient by ID
exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id).populate(
      "supplier",
      "name phone email",
    );

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    res.json(ingredient);
  } catch (err) {
    console.error("Get ingredient error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create ingredient
exports.createIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.create(req.body);

    await logActivity({
      userId: req.user.id,
      action: "INGREDIENT_CREATED",
      module: "inventory",
      details: { ingredientId: ingredient._id, name: ingredient.name },
      req,
    });

    res.status(201).json({ message: "Ingredient created", ingredient });
  } catch (err) {
    console.error("Create ingredient error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update ingredient
exports.updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    await logActivity({
      userId: req.user.id,
      action: "INGREDIENT_UPDATED",
      module: "inventory",
      details: { ingredientId: ingredient._id, name: ingredient.name },
      req,
    });

    res.json({ message: "Ingredient updated", ingredient });
  } catch (err) {
    console.error("Update ingredient error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete ingredient
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    await logActivity({
      userId: req.user.id,
      action: "INGREDIENT_DELETED",
      module: "inventory",
      details: { ingredientId: ingredient._id, name: ingredient.name },
      req,
    });

    res.json({ message: "Ingredient deleted" });
  } catch (err) {
    console.error("Delete ingredient error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get low stock ingredients
exports.getLowStockIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      $expr: { $lte: ["$currentStock", "$minStock"] },
    }).populate("supplier", "name phone");

    res.json(ingredients);
  } catch (err) {
    console.error("Get low stock error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== SUPPLIERS ====================

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (err) {
    console.error("Get suppliers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create supplier
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    await logActivity({
      userId: req.user.id,
      action: "SUPPLIER_CREATED",
      module: "inventory",
      details: { supplierId: supplier._id, name: supplier.name },
      req,
    });

    res.status(201).json({ message: "Supplier created", supplier });
  } catch (err) {
    console.error("Create supplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ message: "Supplier updated", supplier });
  } catch (err) {
    console.error("Update supplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ message: "Supplier deleted" });
  } catch (err) {
    console.error("Delete supplier error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== PURCHASES ====================

// Get all purchases
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier", "name phone")
      .populate("items.ingredient", "name unit")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    console.error("Get purchases error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get purchase by ID
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplier")
      .populate("items.ingredient")
      .populate("createdBy", "name")
      .populate("approvedBy", "name");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    res.json(purchase);
  } catch (err) {
    console.error("Get purchase error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create purchase
exports.createPurchase = async (req, res) => {
  try {
    const purchaseData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const purchase = await Purchase.create(purchaseData);

    // If status is 'Received', update ingredient stock
    if (purchase.status === "Received") {
      for (const item of purchase.items) {
        await Ingredient.findByIdAndUpdate(item.ingredient, {
          $inc: { currentStock: item.quantity },
        });
      }
    }

    await logActivity({
      userId: req.user.id,
      action: "PURCHASE_CREATED",
      module: "inventory",
      details: {
        purchaseId: purchase._id,
        purchaseNumber: purchase.purchaseNumber,
      },
      req,
    });

    res.status(201).json({ message: "Purchase created", purchase });
  } catch (err) {
    console.error("Create purchase error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update purchase status
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    const oldStatus = purchase.status;
    purchase.status = status;

    // If changing to 'Received', update stock
    if (status === "Received" && oldStatus !== "Received") {
      for (const item of purchase.items) {
        await Ingredient.findByIdAndUpdate(item.ingredient, {
          $inc: { currentStock: item.quantity },
        });
      }
      purchase.approvedBy = req.user.id;
    }

    await purchase.save();

    await logActivity({
      userId: req.user.id,
      action: "PURCHASE_STATUS_UPDATED",
      module: "inventory",
      details: { purchaseId: purchase._id, from: oldStatus, to: status },
      req,
    });

    res.json({ message: "Purchase status updated", purchase });
  } catch (err) {
    console.error("Update purchase status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== STOCK ADJUSTMENTS ====================

// Get all stock adjustments
exports.getAllAdjustments = async (req, res) => {
  try {
    const adjustments = await StockAdjustment.find()
      .populate("ingredient", "name unit")
      .populate("createdBy", "name")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    res.json(adjustments);
  } catch (err) {
    console.error("Get adjustments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create stock adjustment
exports.createAdjustment = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.body.ingredient);

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    const adjustmentData = {
      ...req.body,
      previousStock: ingredient.currentStock,
      newStock: ingredient.currentStock + req.body.quantity,
      createdBy: req.user.id,
      cost: ingredient.purchasePrice * Math.abs(req.body.quantity),
    };

    const adjustment = await StockAdjustment.create(adjustmentData);

    // Auto-approve for admin/staff
    if (req.user.role === "admin" || req.user.role === "staff") {
      adjustment.status = "Approved";
      adjustment.approvedBy = req.user.id;
      await adjustment.save();

      // Update ingredient stock
      ingredient.currentStock = adjustmentData.newStock;
      await ingredient.save();
    }

    await logActivity({
      userId: req.user.id,
      action: "STOCK_ADJUSTMENT_CREATED",
      module: "inventory",
      details: {
        adjustmentId: adjustment._id,
        ingredientName: ingredient.name,
        type: adjustment.type,
        quantity: adjustment.quantity,
      },
      req,
    });

    res.status(201).json({ message: "Stock adjustment created", adjustment });
  } catch (err) {
    console.error("Create adjustment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve stock adjustment
exports.approveAdjustment = async (req, res) => {
  try {
    const adjustment = await StockAdjustment.findById(req.params.id);

    if (!adjustment) {
      return res.status(404).json({ message: "Adjustment not found" });
    }

    if (adjustment.status === "Approved") {
      return res.status(400).json({ message: "Already approved" });
    }

    adjustment.status = "Approved";
    adjustment.approvedBy = req.user.id;
    await adjustment.save();

    // Update ingredient stock
    await Ingredient.findByIdAndUpdate(adjustment.ingredient, {
      currentStock: adjustment.newStock,
    });

    res.json({ message: "Adjustment approved", adjustment });
  } catch (err) {
    console.error("Approve adjustment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== RECIPE INGREDIENTS ====================

// Get recipe ingredients for menu item
exports.getRecipeIngredients = async (req, res) => {
  try {
    const recipe = await RecipeIngredient.findOne({
      menuItem: req.params.menuItemId,
    })
      .populate("menuItem", "name price")
      .populate("ingredients.ingredient", "name unit purchasePrice");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (err) {
    console.error("Get recipe ingredients error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create/Update recipe ingredients
exports.saveRecipeIngredients = async (req, res) => {
  try {
    const { menuItem, ingredients, prepTime, notes } = req.body;

    let recipe = await RecipeIngredient.findOne({ menuItem });

    if (recipe) {
      recipe.ingredients = ingredients;
      recipe.prepTime = prepTime;
      recipe.notes = notes;
    } else {
      recipe = new RecipeIngredient({
        menuItem,
        ingredients,
        prepTime,
        notes,
      });
    }

    await recipe.calculateFoodCost();
    await recipe.save();

    await logActivity({
      userId: req.user.id,
      action: "RECIPE_INGREDIENTS_SAVED",
      module: "inventory",
      details: { recipeId: recipe._id, menuItem },
      req,
    });

    res.json({ message: "Recipe ingredients saved", recipe });
  } catch (err) {
    console.error("Save recipe ingredients error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Calculate food cost for menu item
exports.calculateFoodCost = async (req, res) => {
  try {
    const recipe = await RecipeIngredient.findOne({
      menuItem: req.params.menuItemId,
    })
      .populate("menuItem", "name price")
      .populate("ingredients.ingredient", "name purchasePrice");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    await recipe.calculateFoodCost();
    await recipe.save();

    res.json({
      menuItem: recipe.menuItem,
      totalFoodCost: recipe.totalFoodCost,
      foodCostPercentage: recipe.foodCostPercentage,
      ingredients: recipe.ingredients,
    });
  } catch (err) {
    console.error("Calculate food cost error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Deduct stock when order is placed
exports.deductStockForOrder = async (orderId) => {
  try {
    const Order = require("../models/Order");
    const order = await Order.findById(orderId);

    if (!order) return;

    for (const item of order.items) {
      const recipe = await RecipeIngredient.findOne({
        menuItem: item.menuItemId,
      });

      if (recipe) {
        for (const ingredient of recipe.ingredients) {
          await Ingredient.findByIdAndUpdate(ingredient.ingredient, {
            $inc: { currentStock: -(ingredient.quantity * item.qty) },
          });
        }
      }
    }

    console.log(`Stock deducted for order ${orderId}`);
  } catch (err) {
    console.error("Deduct stock error:", err);
  }
};

// Get inventory dashboard stats
exports.getInventoryStats = async (req, res) => {
  try {
    const totalIngredients = await Ingredient.countDocuments();
    const lowStockCount = await Ingredient.countDocuments({
      $expr: { $lte: ["$currentStock", "$minStock"] },
    });
    const outOfStockCount = await Ingredient.countDocuments({
      currentStock: 0,
    });

    const totalPurchases = await Purchase.countDocuments();
    const pendingPurchases = await Purchase.countDocuments({
      status: "Pending",
    });

    const totalValue = await Ingredient.aggregate([
      {
        $project: {
          value: { $multiply: ["$currentStock", "$purchasePrice"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    res.json({
      totalIngredients,
      lowStockCount,
      outOfStockCount,
      totalPurchases,
      pendingPurchases,
      inventoryValue: totalValue[0]?.total || 0,
    });
  } catch (err) {
    console.error("Get inventory stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
