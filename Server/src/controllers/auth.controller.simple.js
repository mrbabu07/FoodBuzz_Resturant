//path: roms-backend/src/controllers/auth.controller.simple.js
// Auth controller WITHOUT activity logging
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, password are required" });
    }

    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailNorm = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: emailNorm });

    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: String(name).trim(),
      email: emailNorm,
      passwordHash,
      address: address ? String(address).trim() : "",
      role: "user",
      isActive: true,
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    console.log("Login attempt:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const emailNorm = String(email).toLowerCase().trim();
    console.log("Looking for user:", emailNorm);

    const user = await User.findOne({ email: emailNorm });

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("User found:", user.email, "Active:", user.isActive);

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);

    if (!ok) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("Login successful for:", user.email);

    const token = signToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
