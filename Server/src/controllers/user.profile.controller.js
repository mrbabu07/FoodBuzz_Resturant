// User Profile Controller
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { logActivity } = require("../utils/activityLogger");

// GET /api/users/me - Get current user profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/me - Update current user profile
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name !== undefined) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (address !== undefined) user.address = String(address).trim();

    await user.save();

    // Log activity
    await logActivity({
      userId,
      action: "PROFILE_UPDATED",
      meta: { fields: Object.keys(req.body) },
      req,
    });

    // Return without password
    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;

    return res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/me/password - Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();

    // Log activity
    await logActivity({
      userId,
      action: "PASSWORD_CHANGED",
      meta: {},
      req,
    });

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/me/notification-preferences - Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      emailNotifications,
      smsNotifications,
      pushNotifications,
      orderUpdates,
      promotions,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize notificationPreferences if it doesn't exist
    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }

    // Update preferences
    if (emailNotifications !== undefined)
      user.notificationPreferences.emailNotifications =
        Boolean(emailNotifications);
    if (smsNotifications !== undefined)
      user.notificationPreferences.smsNotifications = Boolean(smsNotifications);
    if (pushNotifications !== undefined)
      user.notificationPreferences.pushNotifications =
        Boolean(pushNotifications);
    if (orderUpdates !== undefined)
      user.notificationPreferences.orderUpdates = Boolean(orderUpdates);
    if (promotions !== undefined)
      user.notificationPreferences.promotions = Boolean(promotions);

    await user.save();

    // Log activity
    await logActivity({
      userId,
      action: "NOTIFICATION_PREFERENCES_UPDATED",
      meta: { preferences: user.notificationPreferences },
      req,
    });

    return res.json({
      message: "Notification preferences updated",
      preferences: user.notificationPreferences,
    });
  } catch (err) {
    console.error("updateNotificationPreferences error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users/me/notification-preferences - Get notification preferences
exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("notificationPreferences");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Default preferences if not set
    const preferences = user.notificationPreferences || {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderUpdates: true,
      promotions: true,
    };

    return res.json(preferences);
  } catch (err) {
    console.error("getNotificationPreferences error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
