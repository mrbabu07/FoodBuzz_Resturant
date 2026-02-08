const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const notificationController = require("../controllers/notification.controller");

// All routes require authentication
router.use(auth);

// GET /api/notifications - Get user's notifications
router.get("/", notificationController.getNotifications);

// GET /api/notifications/unread-count - Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// GET /api/notifications/analytics - Get analytics
router.get("/analytics", notificationController.getAnalytics);

// POST /api/notifications/test - Send test notification
router.post("/test", notificationController.sendTestNotification);

// PATCH /api/notifications/mark-all-read - Mark all as read
router.patch("/mark-all-read", notificationController.markAllAsRead);

// DELETE /api/notifications - Delete all read notifications
router.delete("/", notificationController.deleteAllRead);

// GET /api/notifications/:id - Get single notification
router.get("/:id", notificationController.getNotification);

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch("/:id/read", notificationController.markAsRead);

// PATCH /api/notifications/:id/click - Mark notification as clicked
router.patch("/:id/click", notificationController.markAsClicked);

// PATCH /api/notifications/:id/dismiss - Mark notification as dismissed
router.patch("/:id/dismiss", notificationController.markAsDismissed);

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
