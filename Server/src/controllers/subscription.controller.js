const Subscription = require("../models/Subscription");
const MenuItem = require("../models/MenuItem");
const { logActivity } = require("../utils/activityLogger");

// GET /api/subscriptions/my - Get user's subscriptions
exports.getMySubscriptions = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { userId: req.user.id };
    if (status) query.status = status;

    const subscriptions = await Subscription.find(query)
      .populate("menuItems.menuItemId", "name price image")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ subscriptions });
  } catch (error) {
    console.error("Get my subscriptions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/subscriptions/:id - Get single subscription
exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("menuItems.menuItemId", "name price image description");

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({ subscription });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/subscriptions - Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const {
      planType,
      planName,
      description,
      menuItems,
      deliverySchedule,
      deliveryAddress,
      pricing,
      startDate,
      endDate,
      paymentMethod,
    } = req.body;

    // Validate menu items exist
    const menuItemIds = menuItems.map((item) => item.menuItemId);
    const validItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      isAvailable: true,
    });

    if (validItems.length !== menuItemIds.length) {
      return res
        .status(400)
        .json({ message: "Some menu items are not available" });
    }

    // Calculate next delivery date
    const nextDeliveryDate = new Date(startDate);

    const subscription = await Subscription.create({
      userId: req.user.id,
      planType,
      planName,
      description,
      menuItems,
      deliverySchedule,
      deliveryAddress,
      pricing,
      startDate,
      endDate,
      nextDeliveryDate,
      paymentMethod,
      status: "active",
    });

    await logActivity({
      userId: req.user.id,
      action: "SUBSCRIPTION_CREATED",
      meta: { subscriptionId: subscription._id, planType },
      req,
    });

    res.status(201).json({
      message: "Subscription created successfully",
      subscription,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/subscriptions/:id/pause - Pause subscription
exports.pauseSubscription = async (req, res) => {
  try {
    const { pauseUntil } = req.body;

    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (subscription.status !== "active") {
      return res
        .status(400)
        .json({ message: "Only active subscriptions can be paused" });
    }

    subscription.pause(pauseUntil ? new Date(pauseUntil) : null);
    await subscription.save();

    await logActivity({
      userId: req.user.id,
      action: "SUBSCRIPTION_PAUSED",
      meta: { subscriptionId: subscription._id, pauseUntil },
      req,
    });

    res.json({
      message: "Subscription paused successfully",
      subscription,
    });
  } catch (error) {
    console.error("Pause subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/subscriptions/:id/resume - Resume subscription
exports.resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (subscription.status !== "paused") {
      return res
        .status(400)
        .json({ message: "Only paused subscriptions can be resumed" });
    }

    subscription.resume();
    await subscription.save();

    await logActivity({
      userId: req.user.id,
      action: "SUBSCRIPTION_RESUMED",
      meta: { subscriptionId: subscription._id },
      req,
    });

    res.json({
      message: "Subscription resumed successfully",
      subscription,
    });
  } catch (error) {
    console.error("Resume subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/subscriptions/:id/cancel - Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (subscription.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Subscription is already cancelled" });
    }

    subscription.status = "cancelled";
    await subscription.save();

    await logActivity({
      userId: req.user.id,
      action: "SUBSCRIPTION_CANCELLED",
      meta: { subscriptionId: subscription._id },
      req,
    });

    res.json({
      message: "Subscription cancelled successfully",
      subscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/subscriptions/:id - Update subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { menuItems, deliverySchedule, deliveryAddress, notes } = req.body;

    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (subscription.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Cannot update cancelled subscription" });
    }

    // Update allowed fields
    if (menuItems) subscription.menuItems = menuItems;
    if (deliverySchedule) subscription.deliverySchedule = deliverySchedule;
    if (deliveryAddress) subscription.deliveryAddress = deliveryAddress;
    if (notes !== undefined) subscription.notes = notes;

    await subscription.save();

    await logActivity({
      userId: req.user.id,
      action: "SUBSCRIPTION_UPDATED",
      meta: { subscriptionId: subscription._id },
      req,
    });

    res.json({
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("Update subscription error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/subscriptions/plans - Get available subscription plans
exports.getAvailablePlans = async (req, res) => {
  try {
    const plans = [
      {
        id: "weekly_lunch",
        name: "Weekly Lunch Plan",
        description: "5 lunches delivered Monday to Friday",
        frequency: "weekly",
        deliveryDays: [1, 2, 3, 4, 5], // Mon-Fri
        discount: 15,
        minPrice: 2000,
        features: [
          "5 meals per week",
          "15% discount",
          "Free delivery",
          "Flexible menu selection",
        ],
      },
      {
        id: "monthly_meal",
        name: "Monthly Meal Plan",
        description: "20 meals delivered throughout the month",
        frequency: "monthly",
        deliveryDays: [1, 2, 3, 4, 5],
        discount: 20,
        minPrice: 7000,
        features: [
          "20 meals per month",
          "20% discount",
          "Free delivery",
          "Priority support",
          "Customizable schedule",
        ],
      },
      {
        id: "custom",
        name: "Custom Plan",
        description: "Create your own meal plan",
        frequency: "custom",
        discount: 10,
        features: [
          "Choose your meals",
          "Choose delivery days",
          "10% discount",
          "Flexible schedule",
        ],
      },
    ];

    res.json({ plans });
  } catch (error) {
    console.error("Get available plans error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin routes

// GET /api/admin/subscriptions - Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) query.status = status;

    const [subscriptions, total] = await Promise.all([
      Subscription.find(query)
        .populate("userId", "name email phone")
        .populate("menuItems.menuItemId", "name price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Subscription.countDocuments(query),
    ]);

    res.json({
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all subscriptions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
