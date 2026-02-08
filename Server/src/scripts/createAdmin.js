//path: backend_sara/roms-backend/src/scripts/createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// ✅ FIX: scripts folder is inside src, so models path is ../models/User
const User = require("../models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "fabliharaidah7@gmail.com";
  const password = "fab123"; // change later
  const name = "System Admin";

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    address: "",
  });

  console.log("✅ Admin created");
  console.log("Email:", email);
  console.log("Pass:", password);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
