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
    const prefs = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize notificationPrefs if it doesn't exist
    if (!user.notificationPrefs) {
      user.notificationPrefs = {};
    }

    // Update all preference fields
    const allowedFields = [
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

    allowedFields.forEach((field) => {
      if (prefs[field] !== undefined) {
        user.notificationPrefs[field] = prefs[field];
      }
    });

    // Mark the subdocument as modified
    user.markModified("notificationPrefs");
    await user.save();

    // Log activity
    await logActivity({
      userId,
      action: "NOTIFICATION_PREFERENCES_UPDATED",
      meta: { updatedFields: Object.keys(prefs) },
      req,
    });

    return res.json({
      message: "Notification preferences updated",
      notificationPrefs: user.notificationPrefs,
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

    const user = await User.findById(userId).select("notificationPrefs");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return preferences with defaults
    const preferences = user.notificationPrefs || {
      orderEmails: true,
      statusEmails: true,
      promoEmails: false,
      pushNotifications: false,
      smsNotifications: false,
      quietHoursEnabled: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      quietHoursWeekendOnly: false,
      notificationFrequency: "instant",
      digestTime: "09:00",
      soundEnabled: true,
      vibrationEnabled: true,
      showPreview: true,
    };

    return res.json({ notificationPrefs: preferences });
  } catch (err) {
    console.error("getNotificationPreferences error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
