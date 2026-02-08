// Script to show complete database information
require("dotenv").config();
const mongoose = require("mongoose");

async function showDatabaseInfo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const admin = db.admin();

    // Show connection info
    console.log("🔗 CONNECTION INFORMATION:");
    console.log("═".repeat(60));
    console.log("Database Name:", db.databaseName);
    console.log(
      "Connection String:",
      process.env.MONGO_URI.replace(/:[^:@]+@/, ":****@"),
    );
    console.log("═".repeat(60));
    console.log();

    // List all databases
    console.log("📚 ALL DATABASES ON THIS CLUSTER:");
    console.log("═".repeat(60));
    const dbList = await admin.listDatabases();
    dbList.databases.forEach((database, index) => {
      const size = (database.sizeOnDisk / 1024 / 1024).toFixed(2);
      console.log(`${index + 1}. ${database.name} (${size} MB)`);
    });
    console.log("═".repeat(60));
    console.log();

    // Show collections in current database
    console.log(`📁 COLLECTIONS IN "${db.databaseName}" DATABASE:`);
    console.log("═".repeat(60));
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log("⚠️  No collections found!");
    } else {
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`📦 ${col.name}`);
        console.log(`   └─ Documents: ${count}`);

        // Show sample document if exists
        if (count > 0) {
          const sample = await db.collection(col.name).findOne();
          const fields = Object.keys(sample).slice(0, 5).join(", ");
          console.log(`   └─ Fields: ${fields}...`);
        }
        console.log();
      }
    }
    console.log("═".repeat(60));

    // MongoDB Atlas URL
    console.log("\n🌐 VIEW IN MONGODB ATLAS:");
    console.log("═".repeat(60));
    console.log("1. Go to: https://cloud.mongodb.com");
    console.log("2. Login to your account");
    console.log("3. Click on cluster: romscluster0");
    console.log("4. Click 'Browse Collections'");
    console.log(`5. Select database: ${db.databaseName}`);
    console.log("═".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

showDatabaseInfo();
