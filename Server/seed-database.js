require("dotenv").config();
const mongoose = require("mongoose");
const Recipe = require("./src/models/Recipe");
const MenuItem = require("./src/models/MenuItem");

const recipes = [
  {
    name: "Grilled Chicken Breast",
    category: "Chicken",
    description: "Juicy grilled chicken breast",
    ingredients: ["Chicken breast", "Olive oil", "Garlic"],
    instructions: "1. Marinate\n2. Grill\n3. Serve",
    prepTime: 40,
    cookTime: 15,
    servings: 4,
    difficulty: "Easy",
    imageUrl:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800",
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Mild",
  },
  {
    name: "Beef Stir Fry",
    category: "Beef",
    description: "Quick beef stir fry",
    ingredients: ["Beef strips", "Bell peppers", "Soy sauce"],
    instructions: "1. Heat oil\n2. Stir fry\n3. Serve",
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    difficulty: "Easy",
    imageUrl:
      "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800",
    allergens: ["Soy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Medium",
  },
  {
    name: "Grilled Salmon",
    category: "Fish",
    description: "Fresh salmon fillet",
    ingredients: ["Salmon", "Lemon", "Dill"],
    instructions: "1. Season\n2. Grill\n3. Serve",
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    difficulty: "Easy",
    imageUrl:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
    allergens: ["Fish"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Mild",
  },
  {
    name: "Tomato Soup",
    category: "Soup",
    description: "Creamy tomato soup",
    ingredients: ["Tomatoes", "Cream", "Basil"],
    instructions: "1. Sauté\n2. Blend\n3. Serve",
    prepTime: 10,
    cookTime: 25,
    servings: 4,
    difficulty: "Easy",
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    allergens: ["Dairy"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Mild",
  },
  {
    name: "Chocolate Cake",
    category: "Dessert",
    description: "Rich chocolate cake",
    ingredients: ["Flour", "Sugar", "Cocoa", "Eggs"],
    instructions: "1. Mix\n2. Bake\n3. Serve",
    prepTime: 20,
    cookTime: 35,
    servings: 8,
    difficulty: "Medium",
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
    allergens: ["Eggs", "Dairy", "Wheat", "Gluten"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "None",
  },
  {
    name: "Fresh Lemonade",
    category: "Drink",
    description: "Refreshing lemonade",
    ingredients: ["Lemons", "Sugar", "Water"],
    instructions: "1. Squeeze\n2. Mix\n3. Serve",
    prepTime: 10,
    cookTime: 0,
    servings: 4,
    difficulty: "Easy",
    imageUrl:
      "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800",
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    spiceLevel: "None",
  },
];

const menuItems = [
  {
    name: "Classic Burger",
    category: "Sandwich",
    description: "Juicy beef patty",
    price: 12.99,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    isAvailable: true,
    allergens: ["Wheat", "Gluten", "Dairy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Mild",
  },
  {
    name: "Margherita Pizza",
    category: "Pizza",
    description: "Fresh mozzarella pizza",
    price: 14.99,
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    isAvailable: true,
    allergens: ["Wheat", "Gluten", "Dairy"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Mild",
  },
  {
    name: "Caesar Salad",
    category: "Salad",
    description: "Crisp romaine lettuce",
    price: 9.99,
    imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800",
    isAvailable: true,
    allergens: ["Dairy", "Eggs", "Fish"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Mild",
  },
  {
    name: "Chicken Wings",
    category: "Appetizer",
    description: "Crispy chicken wings",
    price: 11.99,
    imageUrl:
      "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800",
    isAvailable: true,
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Hot",
  },
  {
    name: "Spaghetti Carbonara",
    category: "Pasta",
    description: "Classic Italian pasta",
    price: 15.99,
    imageUrl:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800",
    isAvailable: true,
    allergens: ["Wheat", "Gluten", "Dairy", "Eggs"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "Mild",
  },
  {
    name: "Grilled Steak",
    category: "Beef",
    description: "Premium ribeye steak",
    price: 24.99,
    imageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800",
    isAvailable: true,
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: "Mild",
  },
  {
    name: "Tiramisu",
    category: "Dessert",
    description: "Classic Italian dessert",
    price: 7.99,
    imageUrl:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
    isAvailable: true,
    allergens: ["Dairy", "Eggs", "Wheat", "Gluten"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "None",
  },
  {
    name: "Iced Coffee",
    category: "Drink",
    description: "Cold brew coffee",
    price: 4.99,
    imageUrl:
      "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800",
    isAvailable: true,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    spiceLevel: "None",
  },
];

async function seedDatabase() {
  try {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Seeding FoodBuzz Database");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");
    console.log("🗑️  Clearing existing data...");
    await Recipe.deleteMany({});
    await MenuItem.deleteMany({});
    console.log("✅ Cleared old data\n");
    console.log("📝 Inserting recipes...");
    const insertedRecipes = await Recipe.insertMany(recipes);
    console.log(`✅ Inserted ${insertedRecipes.length} recipes\n`);
    console.log("🍽️  Inserting menu items...");
    const insertedMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`✅ Inserted ${insertedMenuItems.length} menu items\n`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Database Seeded Successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log(`📚 Recipes: ${insertedRecipes.length}`);
    console.log(`🍽️  Menu Items: ${insertedMenuItems.length}\n`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

seedDatabase();
