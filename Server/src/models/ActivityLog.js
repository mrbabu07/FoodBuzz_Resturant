// path: roms-backend/src/models/ActivityLog.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    meta: { type: Object, default: {} },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
