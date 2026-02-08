// Script to list all collections in the database
require("dotenv").config();
const mongoose = require("mongoose");

async function listCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log("\n📁 Collections in database:");
    console.log("Database:", db.databaseName);
    console.log("─".repeat(50));

    if (collections.length === 0) {
      console.log("No collections found. Database might be empty.");
    } else {
      collections.forEach((col, index) => {
        console.log(`${index + 1}. ${col.name}`);
      });
    }

    console.log("─".repeat(50));
    console.log(`Total: ${collections.length} collections\n`);

    // Count documents in each collection
    console.log("📊 Document counts:");
    console.log("─".repeat(50));
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count} documents`);
    }
    console.log("─".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

listCollections();
