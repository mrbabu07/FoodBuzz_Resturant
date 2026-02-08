// path: backend_sara/roms-backend/src/controllers/admin.staff.controller.js
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

const STAFF_ALLOWED_FIELDS = ["name", "phone", "isActive"];

function pick(obj, fields) {
  const out = {};
  for (const f of fields) if (obj[f] !== undefined) out[f] = obj[f];
  return out;
}

// small helper
function makeRandomPassword(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
  let p = "";
  for (let i = 0; i < len; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

// POST /api/admin/staff  (admin only)
exports.createStaff = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // ✅ password required; if not provided, auto-generate
    let { password } = req.body;

    if (!email) return res.status(400).json({ message: "email is required" });
    const emailNorm = String(email).toLowerCase().trim();

    if (!password) password = makeRandomPassword(10);
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: emailNorm }).lean();
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(String(password), 10);

    const staff = await User.create({
      name: name ? String(name).trim() : "Staff",
      email: emailNorm,
      phone: phone ? String(phone).trim() : "",
      passwordHash: hash,
      role: "staff",         // ✅ fixed
      isActive: true,
    });

    // ✅ Send email (email + password)
    const subject = "Your Staff Account Credentials (ROMS)";
    const text =
`Hello ${staff.name},

Your staff account has been created.

Login Email: ${staff.email}
Password: ${password}

Login URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}/login

Please change your password after login (admin can reset anytime).

- ROMS`;

    // Don't fail creation if mail fails
    try {
      await sendMail({ to: staff.email, subject, text });
    } catch (e) {
      console.warn("Email send failed:", e?.message || e);
    }

    const safe = {
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      isActive: staff.isActive,
      createdAt: staff.createdAt,
    };

    // ✅ password return করবো না (security)
    return res.status(201).json({
      message: "Staff created (credentials sent by email)",
      staff: safe,
    });
  } catch (err) {
    console.error("createStaff error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/staff?search=&active=all|true|false  (admin only)
exports.listStaff = async (req, res) => {
  try {
    const { search, active = "all" } = req.query;

    const filter = { role: "staff" }; // ✅ only staff

    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    if (search) {
      const regex = new RegExp(String(search).trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const staff = await User.find(filter).select("-passwordHash").sort({ createdAt: -1 });
    return res.json(staff);
  } catch (err) {
    console.error("listStaff error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/staff/:id  (admin only)
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

    const staff = await User.findOne({ _id: id, role: "staff" }).select("-passwordHash");
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    return res.json(staff);
  } catch (err) {
    console.error("getStaffById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/admin/staff/:id  (admin only)
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

    const payload = pick(req.body, STAFF_ALLOWED_FIELDS);

    if (payload.name !== undefined) payload.name = String(payload.name).trim();
    if (payload.phone !== undefined) payload.phone = String(payload.phone).trim();
    if (payload.isActive !== undefined) payload.isActive = Boolean(payload.isActive);

    const staff = await User.findOneAndUpdate(
      { _id: id, role: "staff" },
      payload,
      { new: true }
    ).select("-passwordHash");

    if (!staff) return res.status(404).json({ message: "Staff not found" });
    return res.json({ message: "Staff updated", staff });
  } catch (err) {
    console.error("updateStaff error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/admin/staff/:id/password  (admin only)
exports.resetStaffPassword = async (req, res) => {
  try {
    const { id } = req.params;
    let { password } = req.body;

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

    if (!password) password = makeRandomPassword(10);
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hash = await bcrypt.hash(String(password), 10);

    const staff = await User.findOneAndUpdate(
      { _id: id, role: "staff" },
      { passwordHash: hash },
      { new: true }
    ).select("-passwordHash");

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // email new password (optional but useful)
    try {
      await sendMail({
        to: staff.email,
        subject: "Your Staff Password Reset (ROMS)",
        text: `Hello ${staff.name},

Your password has been reset by admin.

Login Email: ${staff.email}
New Password: ${password}

Login: ${(process.env.FRONTEND_URL || "http://localhost:5173")}/login

- ROMS`,
      });
    } catch (e) {
      console.warn("Password email send failed:", e?.message || e);
    }

    return res.json({ message: "Password updated (sent by email)", staff });
  } catch (err) {
    console.error("resetStaffPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/staff/:id
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid staff id" });

    const staff = await User.findOneAndDelete({ _id: id, role: "staff" });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    return res.json({ message: "Staff deleted" });
  } catch (err) {
    console.error("deleteStaff error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
