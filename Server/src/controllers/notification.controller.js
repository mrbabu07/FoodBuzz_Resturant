const Notification = require("../models/Notification");
const { logActivity } = require("../utils/activityLogger");
const mongoose = require("mongoose");

// GET /api/notifications - Get user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, read, priority } = req.query;

    const query = { userId: req.user.id };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by read status
    if (read !== undefined) {
      query.read = read === "true";
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(query),
      Notification.getUnreadCount(req.user.id),
    ]);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/notifications/unread-count - Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/notifications/:id - Get single notification
exports.getNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Get notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/notifications/:id/read - Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.markAsRead();

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/notifications/mark-all-read - Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.user.id);

    await logActivity({
      userId: req.user.id,
      action: "NOTIFICATIONS_MARKED_READ",
      meta: { count: result.modifiedCount },
      req,
    });

    res.json({
      message: "All notifications marked as read",
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/notifications/:id - Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await logActivity({
      userId: req.user.id,
      action: "NOTIFICATION_DELETED",
      meta: { notificationId: req.params.id },
      req,
    });

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/notifications - Delete all read notifications
exports.deleteAllRead = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user.id,
      read: true,
    });

    await logActivity({
      userId: req.user.id,
      action: "READ_NOTIFICATIONS_DELETED",
      meta: { count: result.deletedCount },
      req,
    });

    res.json({
      message: "All read notifications deleted",
      count: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete all read error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/notifications/test - Send test notification (for testing)
exports.sendTestNotification = async (req, res) => {
  try {
    const notification = await Notification.create({
      userId: req.user.id,
      type: "system",
      title: "Test Notification",
      message: "This is a test notification from the system.",
      data: {
        timestamp: new Date().toISOString(),
      },
      priority: "normal",
    });

    await logActivity({
      userId: req.user.id,
      action: "TEST_NOTIFICATION_SENT",
      meta: { notificationId: notification._id },
      req,
    });

    res.json({
      message: "Test notification sent",
      notification,
    });
  } catch (error) {
    console.error("Send test notification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/notifications/analytics - Get notification analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [
      totalNotifications,
      unreadCount,
      readCount,
      clickedCount,
      dismissedCount,
      byType,
      byPriority,
      recentActivity,
    ] = await Promise.all([
      Notification.countDocuments({
        userId: req.user.id,
        createdAt: { $gte: startDate },
      }),
      Notification.countDocuments({
        userId: req.user.id,
        read: false,
      }),
      Notification.countDocuments({
        userId: req.user.id,
        read: true,
        createdAt: { $gte: startDate },
      }),
      Notification.countDocuments({
        userId: req.user.id,
        clicked: true,
        createdAt: { $gte: startDate },
      }),
      Notification.countDocuments({
        userId: req.user.id,
        dismissed: true,
        createdAt: { $gte: startDate },
      }),
      Notification.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user.id),
            createdAt: { $gte: startDate },
          },
        },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Notification.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user.id),
            createdAt: { $gte: startDate },
          },
        },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Notification.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user.id),
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const engagementRate =
      totalNotifications > 0
        ? ((clickedCount / totalNotifications) * 100).toFixed(1)
        : 0;

    const readRate =
      totalNotifications > 0
        ? ((readCount / totalNotifications) * 100).toFixed(1)
        : 0;

    res.json({
      summary: {
        total: totalNotifications,
        unread: unreadCount,
        read: readCount,
        clicked: clickedCount,
        dismissed: dismissedCount,
        engagementRate: parseFloat(engagementRate),
        readRate: parseFloat(readRate),
      },
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivity: recentActivity.map((item) => ({
        date: item._id,
        count: item.count,
      })),
      period: {
        days: parseInt(days),
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Get analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/notifications/:id/click - Mark notification as clicked
exports.markAsClicked = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.clicked = true;
    notification.clickedAt = new Date();
    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date();
    }
    await notification.save();

    res.json({
      message: "Notification marked as clicked",
      notification,
    });
  } catch (error) {
    console.error("Mark as clicked error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/notifications/:id/dismiss - Mark notification as dismissed
exports.markAsDismissed = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.dismissed = true;
    notification.dismissedAt = new Date();
    await notification.save();

    res.json({
      message: "Notification dismissed",
      notification,
    });
  } catch (error) {
    console.error("Mark as dismissed error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
