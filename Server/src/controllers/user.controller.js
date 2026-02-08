//path: roms-backend/src/controllers/user.controller.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { logActivity } = require("../utils/activityLogger");

// GET /api/users/me - Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/me - Update current user profile
exports.updateProfile = async (req, res) => {
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

    await logActivity({
      userId,
      action: "PROFILE_UPDATED",
      meta: { name: user.name, phone: user.phone },
      req,
    });

    // Return without password
    const updated = await User.findById(userId).select("-passwordHash");
    return res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/me/password - Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password required" });
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

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and save new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

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

// GET /api/users/me/notification-preferences
exports.getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("notificationPrefs");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Default preferences if not set
    const prefs = user.notificationPrefs || {
      orderEmails: true,
      statusEmails: true,
      promoEmails: false,
    };

    return res.json(prefs);
  } catch (err) {
    console.error("getNotificationPreferences error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/me/notification-preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const prefs = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update preferences
    user.notificationPrefs = {
      ...user.notificationPrefs,
      ...prefs,
    };

    await user.save();

    await logActivity({
      userId,
      action: "NOTIFICATION_PREFS_UPDATED",
      meta: prefs,
      req,
    });

    return res.json({
      message: "Preferences updated",
      preferences: user.notificationPrefs,
    });
  } catch (err) {
    console.error("updateNotificationPreferences error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
