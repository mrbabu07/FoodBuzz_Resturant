const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const User = require("../models/User");

// GET /api/recommendations/popular - Get popular items
exports.getPopularItems = async (req, res) => {
  try {
    const { limit = 10, category } = req.query;

    // Aggregate orders to find most ordered items
    const pipeline = [
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItemId",
          orderCount: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: parseInt(limit) * 2 }, // Get more to filter by category
      {
        $lookup: {
          from: "menuitems",
          localField: "_id",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      {
        $match: {
          "menuItem.isAvailable": true,
          ...(category && { "menuItem.category": category }),
        },
      },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: "$menuItem._id",
          name: "$menuItem.name",
          description: "$menuItem.description",
          price: "$menuItem.price",
          image: "$menuItem.image",
          category: "$menuItem.category",
          rating: "$menuItem.rating",
          orderCount: 1,
          totalRevenue: 1,
        },
      },
    ];

    const popularItems = await Order.aggregate(pipeline);

    res.json({ items: popularItems });
  } catch (error) {
    console.error("Get popular items error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recommendations/for-you - Get personalized recommendations
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    // Get user's order history
    const userOrders = await Order.find({ userId })
      .select("items")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (userOrders.length === 0) {
      // New user - return popular items
      return exports.getPopularItems(req, res);
    }

    // Extract categories and items user has ordered
    const orderedItemIds = new Set();
    const categoryPreferences = {};

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        orderedItemIds.add(item.menuItemId.toString());
      });
    });

    // Get menu items to find categories
    const orderedItems = await MenuItem.find({
      _id: { $in: Array.from(orderedItemIds) },
    }).select("category");

    orderedItems.forEach((item) => {
      categoryPreferences[item.category] =
        (categoryPreferences[item.category] || 0) + 1;
    });

    // Get top categories
    const topCategories = Object.entries(categoryPreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // Find items in preferred categories that user hasn't ordered
    const recommendations = await MenuItem.find({
      category: { $in: topCategories },
      _id: { $nin: Array.from(orderedItemIds) },
      isAvailable: true,
    })
      .sort({ rating: -1, orderCount: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ items: recommendations });
  } catch (error) {
    console.error("Get personalized recommendations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recommendations/frequently-bought-together - Get items frequently bought together
exports.getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const { menuItemId, limit = 5 } = req.query;

    if (!menuItemId) {
      return res
        .status(400)
        .json({ message: "menuItemId query parameter is required" });
    }

    // Find orders containing this item
    const ordersWithItem = await Order.find({
      "items.menuItemId": menuItemId,
    })
      .select("items")
      .lean();

    // Count co-occurrences
    const coOccurrences = {};

    ordersWithItem.forEach((order) => {
      const itemIds = order.items.map((item) => item.menuItemId.toString());

      itemIds.forEach((itemId) => {
        if (itemId !== menuItemId.toString()) {
          coOccurrences[itemId] = (coOccurrences[itemId] || 0) + 1;
        }
      });
    });

    // Sort by frequency and get top items
    const topItemIds = Object.entries(coOccurrences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map((entry) => entry[0]);

    // Get menu item details
    const items = await MenuItem.find({
      _id: { $in: topItemIds },
      isAvailable: true,
    }).lean();

    // Add frequency data
    const itemsWithFrequency = items.map((item) => ({
      ...item,
      boughtTogetherCount: coOccurrences[item._id.toString()],
    }));

    res.json({ items: itemsWithFrequency });
  } catch (error) {
    console.error("Get frequently bought together error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recommendations/similar - Get similar items
exports.getSimilarItems = async (req, res) => {
  try {
    const { menuItemId, limit = 6 } = req.query;

    if (!menuItemId) {
      return res
        .status(400)
        .json({ message: "menuItemId query parameter is required" });
    }

    const item = await MenuItem.findById(menuItemId);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Find similar items in same category
    const similarItems = await MenuItem.find({
      _id: { $ne: menuItemId },
      category: item.category,
      isAvailable: true,
    })
      .sort({ rating: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ items: similarItems });
  } catch (error) {
    console.error("Get similar items error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recommendations/trending - Get trending items
exports.getTrendingItems = async (req, res) => {
  try {
    const { limit = 10, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get items ordered in the last X days
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["pending", "confirmed", "preparing", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItemId",
          recentOrders: { $sum: "$items.quantity" },
        },
      },
      { $sort: { recentOrders: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "menuitems",
          localField: "_id",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      {
        $match: {
          "menuItem.isAvailable": true,
        },
      },
      {
        $project: {
          _id: "$menuItem._id",
          name: "$menuItem.name",
          description: "$menuItem.description",
          price: "$menuItem.price",
          image: "$menuItem.image",
          category: "$menuItem.category",
          rating: "$menuItem.rating",
          recentOrders: 1,
        },
      },
    ];

    const trendingItems = await Order.aggregate(pipeline);

    res.json({ items: trendingItems });
  } catch (error) {
    console.error("Get trending items error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recommendations/new - Get new items
exports.getNewItems = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const newItems = await MenuItem.find({ isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ items: newItems });
  } catch (error) {
    console.error("Get new items error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
