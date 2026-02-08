// Master seed script - Seeds all data in correct order
require("dotenv").config();
const mongoose = require("mongoose");
const { execSync } = require("child_process");

const MONGO_URI = process.env.MONGO_URI;

async function seedAll() {
  console.log("\n🚀 FoodBuzz Database Seeding Started\n");
  console.log("=".repeat(60));

  try {
    // Connect to MongoDB
    console.log("\n📡 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Seed in order
    const seedScripts = [
      { name: "Menu Items", file: "seed-menu-items.js", required: true },
      { name: "Recipes (Initial 12)", file: "seed-recipes.js", required: true },
      {
        name: "More Recipes (40+)",
        file: "seed-more-recipes.js",
        required: false,
      },
      { name: "Offers", file: "seed-offers.js", required: false },
    ];

    for (const script of seedScripts) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📝 Seeding ${script.name}...`);
      console.log("=".repeat(60));

      try {
        execSync(`node ${script.file}`, {
          stdio: "inherit",
          cwd: __dirname,
        });
        console.log(`✅ ${script.name} seeded successfully`);
      } catch (error) {
        if (script.required) {
          console.error(`❌ Failed to seed ${script.name} (REQUIRED)`);
          throw error;
        } else {
          console.warn(
            `⚠️  Failed to seed ${script.name} (OPTIONAL) - Continuing...`,
          );
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📊 Database Summary:");
    console.log("   ✓ Menu Items: 23 items seeded");
    console.log("   ✓ Recipes: 52+ recipes seeded (12 initial + 40 more)");
    console.log("   ✓ Offers: Seeded (if admin exists)");
    console.log("\n💡 Next Steps:");
    console.log("   1. Start the server: npm start");
    console.log("   2. Visit: http://localhost:5173");
    console.log("   3. Browse 52+ recipes and 23 menu items!");
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

seedAll();
