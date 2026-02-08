// path: roms-backend/src/controllers/admin.user.controller.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");
const Activity = require("../models/ActivityLog"); // ✅ NEW

// allowed updates by admin
const USER_UPDATE_ALLOWED = ["name", "phone", "address", "isActive"];

function pick(obj, fields) {
  const out = {};
  for (const f of fields) if (obj && obj[f] !== undefined) out[f] = obj[f];
  return out;
}

// GET /api/admin/users?search=&active=all|true|false&page=1&limit=20
exports.listUsers = async (req, res) => {
  try {
    const { search, active = "all" } = req.query;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const filter = { role: "user" };

    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.json({ page, limit, total, data: users });
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findOne({ _id: id, role: "user" })
      .select("-passwordHash")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const payload = pick(req.body, USER_UPDATE_ALLOWED);

    if (payload.name) payload.name = String(payload.name).trim();
    if (payload.phone) payload.phone = String(payload.phone).trim();
    if (payload.address) payload.address = String(payload.address).trim();

    const user = await User.findOneAndUpdate({ _id: id, role: "user" }, payload, { new: true })
      .select("-passwordHash")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User updated", user });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/users/:id/orders
exports.getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findOne({ _id: id, role: "user" }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const orders = await Order.find({ userId: id }).sort({ createdAt: -1 }).lean();

    return res.json({ userId: id, total: orders.length, data: orders });
  } catch (err) {
    console.error("getUserOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW: GET /api/admin/users/:id/activity?limit=50
exports.getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(200, Math.max(1, Number(req.query.limit || 50)));

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findOne({ _id: id, role: "user" }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const logs = await Activity.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({ userId: id, total: logs.length, data: logs });
  } catch (err) {
    console.error("getUserActivity error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findOneAndDelete({ _id: id, role: "user" });
    if (!user) return res.status(404).json({ message: "User not found" });

    // optional: delete orders too
    // await Order.deleteMany({ userId: id });

    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
