// path: roms-backend/src/utils/activityLogger.js
const Activity = require("../models/ActivityLog"); // ✅ FIXED: file name match

async function logActivity({ userId, action, meta = {}, req }) {
  try {
    await Activity.create({
      userId,
      action,
      meta,
      ip: req?.ip,
      userAgent: req?.headers?.["user-agent"],
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
}

module.exports = { logActivity };
