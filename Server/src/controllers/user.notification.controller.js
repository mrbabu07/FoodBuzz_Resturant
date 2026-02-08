const User = require("../models/User");
const { logActivity } = require("../utils/activityLogger");

const ALLOWED_KEYS = [
  "orderEmails",
  "statusEmails",
  "promoEmails",
  "pushNotifications",
  "smsNotifications",
  "quietHoursEnabled",
  "quietHoursStart",
  "quietHoursEnd",
  "quietHoursWeekendOnly",
  "notificationFrequency",
  "digestTime",
  "soundEnabled",
  "vibrationEnabled",
  "showPreview",
];

// GET /api/users/me/notifications
exports.getMyNotificationPrefs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "email name phone notificationPrefs pushSubscription",
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    const prefs = {
      orderEmails: user.notificationPrefs?.orderEmails ?? true,
      statusEmails: user.notificationPrefs?.statusEmails ?? true,
      promoEmails: user.notificationPrefs?.promoEmails ?? false,
      pushNotifications: user.notificationPrefs?.pushNotifications ?? false,
      smsNotifications: user.notificationPrefs?.smsNotifications ?? false,
      quietHoursEnabled: user.notificationPrefs?.quietHoursEnabled ?? false,
      quietHoursStart: user.notificationPrefs?.quietHoursStart ?? "22:00",
      quietHoursEnd: user.notificationPrefs?.quietHoursEnd ?? "08:00",
      quietHoursWeekendOnly:
        user.notificationPrefs?.quietHoursWeekendOnly ?? false,
      notificationFrequency:
        user.notificationPrefs?.notificationFrequency ?? "instant",
      digestTime: user.notificationPrefs?.digestTime ?? "09:00",
      soundEnabled: user.notificationPrefs?.soundEnabled ?? true,
      vibrationEnabled: user.notificationPrefs?.vibrationEnabled ?? true,
      showPreview: user.notificationPrefs?.showPreview ?? true,
    };

    res.json({
      email: user.email,
      name: user.name,
      phone: user.phone,
      notificationPrefs: prefs,
      hasPushSubscription: !!user.pushSubscription,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/users/me/notifications
exports.updateMyNotificationPrefs = async (req, res) => {
  try {
    const update = {};

    for (const key of ALLOWED_KEYS) {
      if (req.body[key] !== undefined) {
        // Handle boolean fields
        if (
          [
            "orderEmails",
            "statusEmails",
            "promoEmails",
            "pushNotifications",
            "smsNotifications",
            "quietHoursEnabled",
            "quietHoursWeekendOnly",
            "soundEnabled",
            "vibrationEnabled",
            "showPreview",
          ].includes(key)
        ) {
          update[`notificationPrefs.${key}`] = Boolean(req.body[key]);
        }
        // Handle string fields
        else if (
          [
            "quietHoursStart",
            "quietHoursEnd",
            "notificationFrequency",
            "digestTime",
          ].includes(key)
        ) {
          update[`notificationPrefs.${key}`] = String(req.body[key]);
        }
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        message: "Nothing to update",
        allowed: ALLOWED_KEYS,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true },
    ).select("notificationPrefs");

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: "NOTIFICATION_PREFS_UPDATED",
      meta: update,
      req,
    });

    res.json({
      message: "Notification preferences updated",
      notificationPrefs: user.notificationPrefs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users/me/push-subscription
exports.savePushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription data" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        pushSubscription: subscription,
        "notificationPrefs.pushNotifications": true,
      },
      { new: true },
    ).select("notificationPrefs pushSubscription");

    await logActivity({
      userId: req.user.id,
      action: "PUSH_SUBSCRIPTION_SAVED",
      meta: { endpoint: subscription.endpoint },
      req,
    });

    res.json({
      message: "Push subscription saved",
      subscription: user.pushSubscription,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/users/me/push-subscription
exports.removePushSubscription = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $unset: { pushSubscription: 1 },
        "notificationPrefs.pushNotifications": false,
      },
      { new: true },
    ).select("notificationPrefs");

    await logActivity({
      userId: req.user.id,
      action: "PUSH_SUBSCRIPTION_REMOVED",
      req,
    });

    res.json({
      message: "Push subscription removed",
      notificationPrefs: user.notificationPrefs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users/me/test-notification
exports.sendTestNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email pushSubscription notificationPrefs",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notifications = [];

    // Send test push notification if enabled and subscription exists
    if (user.notificationPrefs?.pushNotifications && user.pushSubscription) {
      try {
        // In a real app, you would use a service like Firebase Cloud Messaging
        // or web-push library to send actual push notifications
        notifications.push({
          type: "push",
          status: "simulated",
          message: "Push notification would be sent here",
        });
      } catch (error) {
        console.error("Push notification error:", error);
      }
    }

    // Simulate email notification
    if (user.notificationPrefs?.orderEmails) {
      notifications.push({
        type: "email",
        status: "simulated",
        recipient: user.email,
        message: "Test email notification",
      });
    }

    // Simulate SMS notification
    if (user.notificationPrefs?.smsNotifications && user.phone) {
      notifications.push({
        type: "sms",
        status: "simulated",
        recipient: user.phone,
        message: "Test SMS notification",
      });
    }

    await logActivity({
      userId: req.user.id,
      action: "TEST_NOTIFICATION_SENT",
      meta: { notifications },
      req,
    });

    res.json({
      message: "Test notifications sent",
      notifications,
      note: "This is a demo - actual notifications would be sent in production",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users/vapid-public-key
exports.getVapidPublicKey = async (req, res) => {
  try {
    const { getVapidPublicKey } = require("../utils/pushService");
    const publicKey = getVapidPublicKey();

    if (!publicKey) {
      return res.status(404).json({
        message: "VAPID keys not configured",
        note: "Run: npx web-push generate-vapid-keys",
      });
    }

    res.json({ publicKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
