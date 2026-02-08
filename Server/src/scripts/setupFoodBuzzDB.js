// Complete FoodBuzz Database Setup Script
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Recipe = require("../models/Recipe");

console.log("🚀 FoodBuzz Database Setup");
console.log("═".repeat(60));

async function setupDatabase() {
  try {
    // Connect to MongoDB
    console.log("\n📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");
    console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);

    // Clear existing data (optional)
    console.log("\n🗑️  Clearing existing data...");
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Recipe.deleteMany({});
    console.log("✅ Database cleared");

    // Create Admin User
    console.log("\n👤 Creating Admin User...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "FoodBuzz Admin",
      email: "admin@foodbuzz.com",
      passwordHash: adminPassword,
      role: "admin",
      address: "Dhaka, Bangladesh",
      phone: "01700000000",
    });
    console.log("✅ Admin created");
    console.log("   Email: admin@foodbuzz.com");
    console.log("   Password: admin123");

    // Create Staff User
    console.log("\n👨‍🍳 Creating Staff User...");
    const staffPassword = await bcrypt.hash("staff123", 10);
    const staff = await User.create({
      name: "Kitchen Staff",
      email: "staff@foodbuzz.com",
      passwordHash: staffPassword,
      role: "staff",
      address: "Dhaka, Bangladesh",
      phone: "01700000001",
    });
    console.log("✅ Staff created");
    console.log("   Email: staff@foodbuzz.com");
    console.log("   Password: staff123");

    // Create Demo Customer
    console.log("\n🙋 Creating Demo Customer...");
    const customerPassword = await bcrypt.hash("customer123", 10);
    const customer = await User.create({
      name: "Demo Customer",
      email: "customer@foodbuzz.com",
      passwordHash: customerPassword,
      role: "user",
      address: "Chittagong, Bangladesh",
      phone: "01700000002",
    });
    console.log("✅ Customer created");
    console.log("   Email: customer@foodbuzz.com");
    console.log("   Password: customer123");

    // Seed Menu Items
    console.log("\n🍔 Seeding Menu Items...");
    const menuItems = [
      // Chicken
      {
        name: "Chicken Burger",
        description: "Juicy grilled chicken burger",
        category: "Chicken",
        price: 280,
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
        isAvailable: true,
      },
      {
        name: "Chicken Fry",
        description: "Crispy fried chicken",
        category: "Chicken",
        price: 300,
        imageUrl:
          "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600",
        isAvailable: true,
      },
      {
        name: "Chicken Wings",
        description: "Spicy buffalo wings",
        category: "Chicken",
        price: 350,
        imageUrl:
          "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600",
        isAvailable: true,
      },
      {
        name: "Chicken Tikka",
        description: "Marinated grilled chicken",
        category: "Chicken",
        price: 320,
        imageUrl:
          "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600",
        isAvailable: true,
      },

      // Beef
      {
        name: "Beef Burger",
        description: "Classic beef burger",
        category: "Beef",
        price: 320,
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
        isAvailable: true,
      },
      {
        name: "Beef Steak",
        description: "Tender grilled steak",
        category: "Beef",
        price: 550,
        imageUrl:
          "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600",
        isAvailable: true,
      },
      {
        name: "Beef Kebab",
        description: "Spiced beef kebab",
        category: "Beef",
        price: 380,
        imageUrl:
          "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600",
        isAvailable: true,
      },

      // Fish
      {
        name: "Fish Curry",
        description: "Traditional fish curry",
        category: "Fish",
        price: 350,
        imageUrl:
          "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600",
        isAvailable: true,
      },
      {
        name: "Fried Fish",
        description: "Crispy fried fish",
        category: "Fish",
        price: 380,
        imageUrl:
          "https://images.unsplash.com/photo-1580959375944-1ab5b8c78f15?w=600",
        isAvailable: true,
      },
      {
        name: "Grilled Salmon",
        description: "Fresh grilled salmon",
        category: "Fish",
        price: 650,
        imageUrl:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
        isAvailable: true,
      },

      // Pizza
      {
        name: "Margherita Pizza",
        description: "Classic tomato and cheese",
        category: "Pizza",
        price: 450,
        imageUrl:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
        isAvailable: true,
      },
      {
        name: "Pepperoni Pizza",
        description: "Loaded with pepperoni",
        category: "Pizza",
        price: 520,
        imageUrl:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
        isAvailable: true,
      },
      {
        name: "BBQ Chicken Pizza",
        description: "BBQ sauce and chicken",
        category: "Pizza",
        price: 580,
        imageUrl:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
        isAvailable: true,
      },

      // Pasta
      {
        name: "Spaghetti Carbonara",
        description: "Creamy pasta with bacon",
        category: "Pasta",
        price: 380,
        imageUrl:
          "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600",
        isAvailable: true,
      },
      {
        name: "Chicken Alfredo",
        description: "Creamy alfredo with chicken",
        category: "Pasta",
        price: 420,
        imageUrl:
          "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600",
        isAvailable: true,
      },
      {
        name: "Lasagna",
        description: "Layered pasta with meat",
        category: "Pasta",
        price: 480,
        imageUrl:
          "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600",
        isAvailable: true,
      },

      // Soup
      {
        name: "Chicken Soup",
        description: "Warm chicken soup",
        category: "Soup",
        price: 150,
        imageUrl:
          "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600",
        isAvailable: true,
      },
      {
        name: "Tomato Soup",
        description: "Creamy tomato soup",
        category: "Soup",
        price: 120,
        imageUrl:
          "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600",
        isAvailable: true,
      },

      // Dessert
      {
        name: "Chocolate Cake",
        description: "Rich chocolate cake",
        category: "Dessert",
        price: 180,
        imageUrl:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
        isAvailable: true,
      },
      {
        name: "Ice Cream Sundae",
        description: "Vanilla ice cream sundae",
        category: "Dessert",
        price: 150,
        imageUrl:
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600",
        isAvailable: true,
      },
      {
        name: "Cheesecake",
        description: "New York style cheesecake",
        category: "Dessert",
        price: 220,
        imageUrl:
          "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=600",
        isAvailable: true,
      },

      // Drinks
      {
        name: "Coca Cola",
        description: "Chilled Coca Cola",
        category: "Drink",
        price: 60,
        imageUrl:
          "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600",
        isAvailable: true,
      },
      {
        name: "Fresh Orange Juice",
        description: "Freshly squeezed",
        category: "Drink",
        price: 120,
        imageUrl:
          "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
        isAvailable: true,
      },
      {
        name: "Mango Smoothie",
        description: "Creamy mango smoothie",
        category: "Drink",
        price: 150,
        imageUrl:
          "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600",
        isAvailable: true,
      },
    ];

    const menuResult = await MenuItem.insertMany(menuItems);
    console.log(`✅ Added ${menuResult.length} menu items`);

    // Seed Recipes
    console.log("\n📖 Seeding Recipes...");
    const recipes = [
      {
        name: "Chicken Tikka Masala",
        description: "Creamy tomato-based curry",
        category: "Chicken",
        imageUrl:
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
        ingredients: [
          "500g chicken",
          "1 cup yogurt",
          "2 tbsp tikka masala",
          "1 can tomato sauce",
          "1 cup cream",
        ],
        steps: [
          "Marinate chicken",
          "Grill chicken",
          "Make sauce",
          "Combine and simmer",
        ],
        prepTime: 30,
        cookTime: 40,
        servings: 4,
      },
      {
        name: "Beef Stroganoff",
        description: "Tender beef in creamy sauce",
        category: "Beef",
        imageUrl:
          "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600",
        ingredients: [
          "500g beef",
          "200g mushrooms",
          "1 cup sour cream",
          "2 cups broth",
        ],
        steps: ["Sear beef", "Cook mushrooms", "Make sauce", "Combine"],
        prepTime: 15,
        cookTime: 30,
        servings: 4,
      },
      {
        name: "Grilled Salmon",
        description: "Fresh salmon with lemon butter",
        category: "Fish",
        imageUrl:
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
        ingredients: [
          "4 salmon fillets",
          "4 tbsp butter",
          "2 lemons",
          "Fresh dill",
        ],
        steps: ["Season salmon", "Grill", "Make butter sauce", "Serve"],
        prepTime: 10,
        cookTime: 15,
        servings: 4,
      },
    ];

    const recipeResult = await Recipe.insertMany(recipes);
    console.log(`✅ Added ${recipeResult.length} recipes`);

    // Summary
    console.log("\n" + "═".repeat(60));
    console.log("🎉 FoodBuzz Database Setup Complete!");
    console.log("═".repeat(60));
    console.log("\n📊 Database Summary:");
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Menu Items: ${await MenuItem.countDocuments()}`);
    console.log(`   Recipes: ${await Recipe.countDocuments()}`);

    console.log("\n🔐 Login Credentials:");
    console.log("   Admin:    admin@foodbuzz.com / admin123");
    console.log("   Staff:    staff@foodbuzz.com / staff123");
    console.log("   Customer: customer@foodbuzz.com / customer123");

    console.log("\n🌐 Next Steps:");
    console.log("   1. Start backend: npm run dev");
    console.log("   2. Start frontend: npm run dev");
    console.log("   3. Login with credentials above");
    console.log("═".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();
