//path: backend_sara/roms-backend/src/controllers/admin.controller.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Order = require("../models/Order");

function parseDateRange(req) {
  // accepts YYYY-MM-DD
  const { from, to } = req.query;

  const range = {};
  if (from) {
    const d = new Date(from);
    if (!isNaN(d)) range.$gte = d;
  }
  if (to) {
    // include end day: set to end of day
    const d = new Date(to);
    if (!isNaN(d)) {
      d.setHours(23, 59, 59, 999);
      range.$lte = d;
    }
  }
  return Object.keys(range).length ? range : null;
}

// GET /api/admin/stats  (admin only)
exports.getStats = async (req, res) => {
  try {
    // Basic counts
    const [totalUsers, totalRecipes, totalOrders, totalMenuItems] =
      await Promise.all([
        User.countDocuments(),
        Recipe.countDocuments(),
        Order.countDocuments(),
        require("../models/MenuItem").countDocuments(),
      ]);

    // Today's data
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [todayOrders, todayRevenue] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: "Delivered",
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    // Order status breakdown
    const [deliveredOrders, pendingOrders, processingOrders, cancelledOrders] =
      await Promise.all([
        Order.countDocuments({ status: "Delivered" }),
        Order.countDocuments({ status: "Placed" }),
        Order.countDocuments({ status: { $in: ["Processing", "Ready"] } }),
        Order.countDocuments({ status: "Cancelled" }),
      ]);

    // Payment statistics
    const Payment = require("../models/Payment");
    const [totalPayments, completedPayments, pendingPayments, failedPayments] =
      await Promise.all([
        Payment.countDocuments(),
        Payment.countDocuments({ status: "completed" }),
        Payment.countDocuments({ status: "pending" }),
        Payment.countDocuments({ status: "failed" }),
      ]);

    // Revenue calculations
    const revenueData = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]);

    const revenue = revenueData[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    };

    // Payment method breakdown
    const paymentMethods = await Order.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newUsersThisWeek, ordersThisWeek] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    // Top selling items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topItems = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItemId",
          name: { $first: "$items.name" },
          totalQty: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    return res.json({
      // Basic stats
      totalUsers,
      totalRecipes,
      totalOrders,
      totalMenuItems,

      // Today's stats
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,

      // Order status
      deliveredOrders,
      pendingOrders,
      processingOrders,
      cancelledOrders,

      // Payment stats
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,

      // Revenue
      totalRevenue: revenue.totalRevenue,
      avgOrderValue: Math.round(revenue.avgOrderValue || 0),

      // Payment methods
      paymentMethods: paymentMethods.map((pm) => ({
        method: pm._id || "Unknown",
        count: pm.count,
      })),

      // Recent activity
      newUsersThisWeek,
      ordersThisWeek,

      // Top items
      topItems: topItems.map((item) => ({
        id: item._id,
        name: item.name,
        quantity: item.totalQty,
        revenue: Math.round(item.totalRevenue),
      })),
    });
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/reports/sales?from=&to=   (admin only)
exports.getSalesReport = async (req, res) => {
  try {
    const createdAtRange = parseDateRange(req);

    const match = { status: "Delivered" };
    if (createdAtRange) match.createdAt = createdAtRange;

    const rows = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const summary = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalDelivered: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = summary?.[0]?.totalRevenue || 0;
    const totalDelivered = summary?.[0]?.totalDelivered || 0;

    return res.json({
      from: req.query.from || null,
      to: req.query.to || null,
      totalRevenue,
      totalDelivered,
      daily: rows.map((r) => ({
        date: r._id,
        revenue: r.revenue,
        orders: r.orders,
      })),
    });
  } catch (err) {
    console.error("getSalesReport error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/reports/orders-by-status?from=&to=
exports.getOrdersByStatus = async (req, res) => {
  try {
    const createdAtRange = parseDateRange(req);

    const match = {};
    if (createdAtRange) match.createdAt = createdAtRange;

    const rows = await Order.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.json({
      from: req.query.from || null,
      to: req.query.to || null,
      data: rows.map((r) => ({ status: r._id || "Unknown", count: r.count })),
    });
  } catch (err) {
    console.error("getOrdersByStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/reports/top-recipes?from=&to=&limit=10
exports.getTopRecipes = async (req, res) => {
  try {
    const createdAtRange = parseDateRange(req);
    const limit = Math.max(1, Number(req.query.limit || 10));

    const match = {};
    if (createdAtRange) match.createdAt = createdAtRange;

    const rows = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.recipeId",
          name: { $first: "$items.name" },
          qty: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: limit },
    ]);

    return res.json({
      from: req.query.from || null,
      to: req.query.to || null,
      limit,
      data: rows.map((r) => ({
        recipeId: r._id,
        name: r.name,
        qty: r.qty,
        revenue: r.revenue,
      })),
    });
  } catch (err) {
    console.error("getTopRecipes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
