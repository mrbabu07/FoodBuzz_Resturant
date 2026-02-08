const router = require("express").Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");

const {
  getProfile,
  updateProfile,
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
} = require("../controllers/user.controller");

const {
  getMyNotificationPrefs,
  updateMyNotificationPrefs,
  savePushSubscription,
  removePushSubscription,
  sendTestNotification,
} = require("../controllers/user.notification.controller");

// Profile routes
router.get("/me", auth, allowRoles("user", "admin", "staff"), getProfile);
router.put("/me", auth, allowRoles("user", "admin", "staff"), updateProfile);
router.put(
  "/me/password",
  auth,
  allowRoles("user", "admin", "staff"),
  changePassword,
);

// Notification preferences
router.get(
  "/me/notification-preferences",
  auth,
  allowRoles("user", "admin"),
  getNotificationPreferences,
);
router.put(
  "/me/notification-preferences",
  auth,
  allowRoles("user", "admin"),
  updateNotificationPreferences,
);

// Legacy notification routes (keep for compatibility)
router.get(
  "/me/notifications",
  auth,
  allowRoles("user"),
  getMyNotificationPrefs,
);
router.patch(
  "/me/notifications",
  auth,
  allowRoles("user"),
  updateMyNotificationPrefs,
);

// Push notification routes
router.post(
  "/me/push-subscription",
  auth,
  allowRoles("user", "admin"),
  savePushSubscription,
);
router.delete(
  "/me/push-subscription",
  auth,
  allowRoles("user", "admin"),
  removePushSubscription,
);

// Test notification
router.post(
  "/me/test-notification",
  auth,
  allowRoles("user", "admin"),
  sendTestNotification,
);

module.exports = router;
