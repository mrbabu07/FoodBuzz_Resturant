// Script to seed menu items into the database
require("dotenv").config();
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");

const menuItems = [
  // Chicken Items
  {
    name: "Chicken Burger",
    description:
      "Juicy grilled chicken patty with fresh lettuce, tomato, and special sauce",
    category: "Chicken",
    price: 280,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "250g",
  },
  {
    name: "Chicken Fry",
    description: "Crispy fried chicken pieces with special spices",
    category: "Chicken",
    price: 300,
    imageUrl:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300g",
  },
  {
    name: "Chicken Wings",
    description: "Spicy buffalo wings with ranch dipping sauce",
    category: "Chicken",
    price: 350,
    imageUrl:
      "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "400g",
  },
  {
    name: "Chicken Tikka",
    description: "Marinated chicken pieces grilled to perfection",
    category: "Chicken",
    price: 320,
    imageUrl:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "350g",
  },
  {
    name: "Chicken Shawarma",
    description: "Wrapped chicken with vegetables and special sauce",
    category: "Chicken",
    price: 250,
    imageUrl:
      "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300g",
  },

  // Beef Items
  {
    name: "Beef Burger",
    description: "Classic beef burger with cheese, lettuce, and tomato",
    category: "Beef",
    price: 320,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300g",
  },
  {
    name: "Beef Steak",
    description: "Tender grilled beef steak with herbs and butter",
    category: "Beef",
    price: 550,
    imageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "400g",
  },
  {
    name: "Beef Kebab",
    description: "Spiced minced beef grilled on skewers",
    category: "Beef",
    price: 380,
    imageUrl:
      "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "350g",
  },
  {
    name: "Beef Curry",
    description: "Slow-cooked beef in rich curry sauce",
    category: "Beef",
    price: 420,
    imageUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "400g",
  },

  // Fish Items
  {
    name: "Fish Curry",
    description: "Traditional fish curry with aromatic spices",
    category: "Fish",
    price: 350,
    imageUrl:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "350g",
  },
  {
    name: "Fried Fish",
    description: "Crispy fried fish fillet with tartar sauce",
    category: "Fish",
    price: 380,
    imageUrl:
      "https://images.unsplash.com/photo-1580959375944-1ab5b8c78f15?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300g",
  },
  {
    name: "Grilled Salmon",
    description: "Fresh salmon grilled with lemon and herbs",
    category: "Fish",
    price: 650,
    imageUrl:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "350g",
  },
  {
    name: "Fish & Chips",
    description: "Classic battered fish with crispy fries",
    category: "Fish",
    price: 420,
    imageUrl:
      "https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "450g",
  },

  // Soup Items
  {
    name: "Chicken Soup",
    description: "Warm chicken soup with vegetables",
    category: "Soup",
    price: 150,
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300ml",
  },
  {
    name: "Tomato Soup",
    description: "Creamy tomato soup with basil",
    category: "Soup",
    price: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300ml",
  },
  {
    name: "Mushroom Soup",
    description: "Rich creamy mushroom soup",
    category: "Soup",
    price: 140,
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300ml",
  },
  {
    name: "Vegetable Soup",
    description: "Healthy mixed vegetable soup",
    category: "Soup",
    price: 110,
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300ml",
  },

  // Dessert Items
  {
    name: "Chocolate Cake",
    description: "Rich chocolate cake with chocolate frosting",
    category: "Dessert",
    price: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "150g",
  },
  {
    name: "Ice Cream Sundae",
    description: "Vanilla ice cream with chocolate sauce and nuts",
    category: "Dessert",
    price: 150,
    imageUrl:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "200g",
  },
  {
    name: "Cheesecake",
    description: "Creamy New York style cheesecake",
    category: "Dessert",
    price: 220,
    imageUrl:
      "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "150g",
  },
  {
    name: "Brownie",
    description: "Warm chocolate brownie with vanilla ice cream",
    category: "Dessert",
    price: 160,
    imageUrl:
      "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "120g",
  },

  // Drink Items
  {
    name: "Coca Cola",
    description: "Chilled Coca Cola",
    category: "Drink",
    price: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "330ml",
  },
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    category: "Drink",
    price: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300ml",
  },
  {
    name: "Mango Smoothie",
    description: "Creamy mango smoothie",
    category: "Drink",
    price: 150,
    imageUrl:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "400ml",
  },
  {
    name: "Iced Coffee",
    description: "Cold brew coffee with ice",
    category: "Drink",
    price: 140,
    imageUrl:
      "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "350ml",
  },
  {
    name: "Mineral Water",
    description: "Bottled mineral water",
    category: "Drink",
    price: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "500ml",
  },
];

async function seedMenuItems() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if menu items already exist
    const count = await MenuItem.countDocuments();
    if (count > 0) {
      console.log(`⚠️  Database already has ${count} menu items.`);
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      readline.question(
        "Do you want to clear and re-seed? (yes/no): ",
        async (answer) => {
          if (answer.toLowerCase() === "yes") {
            await MenuItem.deleteMany({});
            console.log("🗑️  Cleared existing menu items");
            await insertMenuItems();
          } else {
            console.log("❌ Seeding cancelled");
            process.exit(0);
          }
          readline.close();
        },
      );
    } else {
      await insertMenuItems();
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

async function insertMenuItems() {
  try {
    const result = await MenuItem.insertMany(menuItems);
    console.log(`✅ Successfully added ${result.length} menu items!`);

    // Show summary by category
    const categories = {};
    result.forEach((item) => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });

    console.log("\n📊 Menu Items by Category:");
    console.log("─".repeat(50));
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`${cat}: ${count} items`);
    });
    console.log("─".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting menu items:", error.message);
    process.exit(1);
  }
}

seedMenuItems();
