// Server/src/controllers/pos.controller.js
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Ingredient = require("../models/Ingredient");
const RecipeIngredient = require("../models/RecipeIngredient");
const { sendNotification } = require("../utils/notificationService");

/**
 * Create POS Order
 * POST /api/orders/pos
 * Creates order with status = "pending" and auto-updates inventory
 */
exports.createPOSOrder = async (req, res) => {
  try {
    const {
      items,
      orderType,
      notes,
      paymentMethod,
      discount,
      tax,
      total,
      tableNumber,
    } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must contain at least one item" });
    }

    // Validate order type
    if (!["dine-in", "takeaway"].includes(orderType)) {
      return res.status(400).json({ message: "Invalid order type" });
    }

    // Validate payment method
    if (!["cash", "card", "stripe"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Fetch menu items and validate
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ message: "Some menu items not found" });
    }

    // Check availability
    const unavailableItems = menuItems.filter((item) => !item.isAvailable);
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        message: `Items not available: ${unavailableItems.map((i) => i.name).join(", ")}`,
      });
    }

    // Build order items with prices
    const orderItems = items.map((item) => {
      const menuItem = menuItems.find(
        (mi) => mi._id.toString() === item.menuItemId,
      );
      return {
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        qty: item.qty,
        notes: item.notes || "",
      };
    });

    // Calculate totals
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    const calculatedDiscount = discount || 0;
    const calculatedTax = tax || (subtotal - calculatedDiscount) * 0.05;
    const calculatedTotal =
      total || subtotal - calculatedDiscount + calculatedTax;

    // Create order - use req.user.id (from JWT) instead of req.user._id
    const order = await Order.create({
      userId: req.user.id,
      userEmail: req.user.email,
      items: orderItems,
      deliveryAddress:
        orderType === "dine-in" ? `Table ${tableNumber || "N/A"}` : "Takeaway",
      phone: "POS Order",
      notes: notes || "",
      paymentMethod: paymentMethod,
      status: "pending",
      orderType: orderType,
      tableNumber: tableNumber || "",
      discount: calculatedDiscount,
      tax: calculatedTax,
      total: calculatedTotal,
      subtotal: subtotal,
      deliveryFee: 0,
    });

    // Auto-update inventory (deduct stock)
    await deductInventoryStock(orderItems);

    // Send notification
    try {
      await sendNotification({
        userId: req.user.id,
        type: "order_placed",
        title: "Order Placed",
        message: `Your ${orderType} order #${order._id} has been placed successfully!`,
        data: { orderId: order._id.toString() },
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.status(201).json({
      success: true,
      message: "POS order created successfully",
      order,
    });
  } catch (error) {
    console.error("POS order creation error:", error);
    res.status(500).json({
      message: "Failed to create POS order",
      error: error.message,
    });
  }
};

/**
 * Auto-deduct inventory stock based on recipe ingredients
 */
async function deductInventoryStock(orderItems) {
  try {
    for (const item of orderItems) {
      // Find recipe ingredients for this menu item
      const recipeIngredients = await RecipeIngredient.find({
        menuItemId: item.menuItemId,
      }).populate("ingredientId");

      if (recipeIngredients.length === 0) {
        console.log(`No recipe found for menu item: ${item.name}`);
        continue;
      }

      // Deduct stock for each ingredient
      for (const recipeIngredient of recipeIngredients) {
        const ingredient = recipeIngredient.ingredientId;
        const quantityNeeded = recipeIngredient.quantity * item.qty;

        // Update ingredient stock
        ingredient.currentStock -= quantityNeeded;

        // Check if stock is below minimum
        if (ingredient.currentStock < ingredient.minStock) {
          console.warn(
            `Low stock alert: ${ingredient.name} (${ingredient.currentStock} ${ingredient.unit})`,
          );
        }

        await ingredient.save();
      }
    }
  } catch (error) {
    console.error("Inventory deduction error:", error);
    // Don't throw error - order should still be created even if inventory update fails
  }
}

/**
 * Get POS Orders
 * GET /api/orders/pos
 * Get all POS orders (pending, processing, completed)
 */
exports.getPOSOrders = async (req, res) => {
  try {
    const { status, orderType, startDate, endDate } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (orderType) {
      filter.orderType = orderType;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get POS orders error:", error);
    res.status(500).json({
      message: "Failed to fetch POS orders",
      error: error.message,
    });
  }
};

/**
 * Update POS Order Status
 * PATCH /api/orders/pos/:id/status
 */
exports.updatePOSOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "ready",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // Send notification
    try {
      await sendNotification({
        userId: order.userId,
        type: "order_status_update",
        title: "Order Status Updated",
        message: `Your order #${order._id} is now ${status}`,
        data: { orderId: order._id.toString(), status },
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update POS order status error:", error);
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
