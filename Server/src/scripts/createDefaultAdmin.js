// Create default admin user
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function createDefaultUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create Admin
    const adminEmail = "admin@foodbuzz.com";
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      const adminHash = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin User",
        email: adminEmail,
        passwordHash: adminHash,
        role: "admin",
        address: "Admin Office",
        phone: "01700000000",
      });
      console.log("✅ Admin created");
      console.log("   Email: admin@foodbuzz.com");
      console.log("   Password: admin123");
    } else {
      console.log("ℹ️  Admin already exists");
    }

    // Create Staff
    const staffEmail = "staff@foodbuzz.com";
    const staffExists = await User.findOne({ email: staffEmail });

    if (!staffExists) {
      const staffHash = await bcrypt.hash("staff123", 10);
      await User.create({
        name: "Staff User",
        email: staffEmail,
        passwordHash: staffHash,
        role: "staff",
        address: "Restaurant",
        phone: "01700000001",
      });
      console.log("✅ Staff created");
      console.log("   Email: staff@foodbuzz.com");
      console.log("   Password: staff123");
    } else {
      console.log("ℹ️  Staff already exists");
    }

    // Create Customer
    const customerEmail = "customer@foodbuzz.com";
    const customerExists = await User.findOne({ email: customerEmail });

    if (!customerExists) {
      const customerHash = await bcrypt.hash("customer123", 10);
      await User.create({
        name: "Customer User",
        email: customerEmail,
        passwordHash: customerHash,
        role: "user",
        address: "123 Main Street",
        phone: "01700000002",
      });
      console.log("✅ Customer created");
      console.log("   Email: customer@foodbuzz.com");
      console.log("   Password: customer123");
    } else {
      console.log("ℹ️  Customer already exists");
    }

    console.log("\n🎉 All default users ready!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createDefaultUsers();
