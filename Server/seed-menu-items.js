// Seed script for menu items with professional data
require("dotenv").config();
const mongoose = require("mongoose");
const MenuItem = require("./src/models/MenuItem");

const MENU_ITEMS = [
  // BEEF ITEMS (3)
  {
    name: "Classic Beef Burger",
    category: "Beef",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    details:
      "Juicy beef patty with lettuce, tomato, cheese, and special sauce on a toasted bun",
    calories: 650,
    price: 450,
    isAvailable: true,
    allergens: ["Wheat", "Dairy", "Eggs"],
    isHalal: true,
    spiceLevel: "Mild",
  },
  {
    name: "Beef Steak Platter",
    category: "Beef",
    imageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
    details:
      "Premium grilled beef steak served with mashed potatoes and seasonal vegetables",
    calories: 850,
    price: 1200,
    isAvailable: true,
    allergens: ["Dairy"],
    isHalal: true,
    spiceLevel: "None",
  },
  {
    name: "Spicy Beef Tacos",
    category: "Beef",
    imageUrl:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    details:
      "Three soft tacos filled with seasoned beef, salsa, cheese, and fresh cilantro",
    calories: 520,
    price: 380,
    isAvailable: true,
    allergens: ["Wheat", "Dairy"],
    isHalal: true,
    spiceLevel: "Hot",
  },

  // CHICKEN ITEMS (4)
  {
    name: "Crispy Fried Chicken",
    category: "Chicken",
    imageUrl:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80",
    details: "Golden crispy fried chicken pieces with a secret blend of spices",
    calories: 580,
    price: 420,
    isAvailable: true,
    allergens: ["Wheat", "Eggs"],
    isHalal: true,
    spiceLevel: "Medium",
  },
  {
    name: "Grilled Chicken Breast",
    category: "Chicken",
    imageUrl:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80",
    details:
      "Tender grilled chicken breast with herbs, served with rice and salad",
    calories: 420,
    price: 550,
    isAvailable: true,
    allergens: [],
    isHalal: true,
    isGlutenFree: true,
    isDairyFree: true,
    spiceLevel: "Mild",
  },
  {
    name: "Chicken Tikka Masala",
    category: "Chicken",
    imageUrl:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
    details:
      "Tender chicken pieces in rich creamy tomato curry sauce with aromatic spices",
    calories: 680,
    price: 480,
    isAvailable: true,
    allergens: ["Dairy"],
    isHalal: true,
    spiceLevel: "Medium",
  },
  {
    name: "Buffalo Chicken Wings",
    category: "Chicken",
    imageUrl:
      "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&q=80",
    details:
      "Spicy buffalo wings served with blue cheese dip and celery sticks",
    calories: 720,
    price: 390,
    isAvailable: true,
    allergens: ["Dairy"],
    isHalal: true,
    spiceLevel: "Hot",
  },

  // FISH ITEMS (3)
  {
    name: "Grilled Salmon Fillet",
    category: "Fish",
    imageUrl:
      "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&q=80",
    details:
      "Fresh Atlantic salmon grilled to perfection with lemon butter sauce",
    calories: 520,
    price: 850,
    isAvailable: true,
    allergens: ["Fish", "Dairy"],
    isGlutenFree: true,
    spiceLevel: "None",
  },
  {
    name: "Fish and Chips",
    category: "Fish",
    imageUrl:
      "https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=800&q=80",
    details: "Crispy battered fish with golden fries and tartar sauce",
    calories: 780,
    price: 620,
    isAvailable: true,
    allergens: ["Fish", "Wheat", "Eggs"],
    spiceLevel: "None",
  },
  {
    name: "Spicy Tuna Poke Bowl",
    category: "Fish",
    imageUrl:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    details: "Fresh tuna cubes with rice, avocado, edamame, and spicy mayo",
    calories: 480,
    price: 720,
    isAvailable: true,
    allergens: ["Fish", "Soy", "Eggs"],
    isGlutenFree: true,
    spiceLevel: "Medium",
  },

  // SOUP ITEMS (3)
  {
    name: "Creamy Tomato Soup",
    category: "Soup",
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
    details: "Rich and creamy tomato soup with fresh basil and croutons",
    calories: 280,
    price: 220,
    isAvailable: true,
    allergens: ["Dairy", "Wheat"],
    isVegetarian: true,
    spiceLevel: "None",
  },
  {
    name: "Chicken Noodle Soup",
    category: "Soup",
    imageUrl:
      "https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?w=800&q=80",
    details: "Hearty chicken soup with vegetables and egg noodles",
    calories: 320,
    price: 280,
    isAvailable: true,
    allergens: ["Wheat", "Eggs"],
    isHalal: true,
    spiceLevel: "None",
  },
  {
    name: "Spicy Thai Tom Yum",
    category: "Soup",
    imageUrl:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    details: "Hot and sour Thai soup with shrimp, mushrooms, and lemongrass",
    calories: 180,
    price: 350,
    isAvailable: true,
    allergens: ["Shellfish"],
    isGlutenFree: true,
    isDairyFree: true,
    spiceLevel: "Extra Hot",
  },

  // DESSERT ITEMS (4)
  {
    name: "Chocolate Lava Cake",
    category: "Dessert",
    imageUrl:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    details:
      "Warm chocolate cake with molten center, served with vanilla ice cream",
    calories: 520,
    price: 320,
    isAvailable: true,
    allergens: ["Wheat", "Dairy", "Eggs"],
    isVegetarian: true,
    spiceLevel: "None",
  },
  {
    name: "New York Cheesecake",
    category: "Dessert",
    imageUrl:
      "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=800&q=80",
    details:
      "Classic creamy cheesecake with graham cracker crust and berry compote",
    calories: 450,
    price: 380,
    isAvailable: true,
    allergens: ["Wheat", "Dairy", "Eggs"],
    isVegetarian: true,
    spiceLevel: "None",
  },
  {
    name: "Tiramisu",
    category: "Dessert",
    imageUrl:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
    details: "Italian coffee-flavored dessert with mascarpone and cocoa",
    calories: 380,
    price: 350,
    isAvailable: true,
    allergens: ["Wheat", "Dairy", "Eggs"],
    isVegetarian: true,
    spiceLevel: "None",
  },
  {
    name: "Mango Sticky Rice",
    category: "Dessert",
    imageUrl:
      "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800&q=80",
    details: "Sweet sticky rice with fresh mango and coconut cream",
    calories: 320,
    price: 280,
    isAvailable: true,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    isNutFree: true,
    spiceLevel: "None",
  },

  // DRINK ITEMS (6)
  {
    name: "Fresh Orange Juice",
    category: "Drink",
    imageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
    details: "Freshly squeezed orange juice, no added sugar",
    calories: 120,
    price: 150,
    isAvailable: true,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    isNutFree: true,
    spiceLevel: "None",
  },
  {
    name: "Mango Smoothie",
    category: "Drink",
    imageUrl:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&q=80",
    details: "Creamy mango smoothie with yogurt and honey",
    calories: 220,
    price: 180,
    isAvailable: true,
    allergens: ["Dairy"],
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: "None",
  },
  {
    name: "Iced Coffee",
    category: "Drink",
    imageUrl:
      "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80",
    details: "Cold brew coffee with ice and milk",
    calories: 80,
    price: 120,
    isAvailable: true,
    allergens: ["Dairy"],
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: "None",
  },
  {
    name: "Strawberry Milkshake",
    category: "Drink",
    imageUrl:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80",
    details: "Thick and creamy strawberry milkshake topped with whipped cream",
    calories: 380,
    price: 200,
    isAvailable: true,
    allergens: ["Dairy"],
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: "None",
  },
  {
    name: "Green Tea Latte",
    category: "Drink",
    imageUrl:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80",
    details: "Matcha green tea with steamed milk and light sweetness",
    calories: 180,
    price: 160,
    isAvailable: true,
    allergens: ["Dairy"],
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: "None",
  },
  {
    name: "Lemonade",
    category: "Drink",
    imageUrl:
      "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800&q=80",
    details: "Refreshing homemade lemonade with fresh mint",
    calories: 100,
    price: 130,
    isAvailable: true,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    isNutFree: true,
    spiceLevel: "None",
  },
];

async function seedMenuItems() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🗑️  Clearing existing menu items...");
    await MenuItem.deleteMany({});
    console.log("✅ Cleared existing menu items");

    console.log("📝 Inserting new menu items...");
    const inserted = await MenuItem.insertMany(MENU_ITEMS);
    console.log(`✅ Successfully inserted ${inserted.length} menu items`);

    // Show summary by category
    const categories = {};
    inserted.forEach((item) => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });

    console.log("\n📊 Menu Items by Category:");
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} items`);
    });

    console.log("\n🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding menu items:", error);
    process.exit(1);
  }
}

seedMenuItems();
