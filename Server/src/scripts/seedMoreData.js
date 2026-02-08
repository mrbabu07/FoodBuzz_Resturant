// Comprehensive data seeding script
require("dotenv").config();
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Additional Menu Items (30+ more items)
const additionalMenuItems = [
  // Pizza Category
  {
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    category: "Pizza",
    price: 450,
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "12 inch",
  },
  {
    name: "Pepperoni Pizza",
    description: "Loaded with pepperoni and extra cheese",
    category: "Pizza",
    price: 520,
    imageUrl:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "12 inch",
  },
  {
    name: "BBQ Chicken Pizza",
    description: "BBQ sauce, grilled chicken, onions, and cilantro",
    category: "Pizza",
    price: 580,
    imageUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "12 inch",
  },
  {
    name: "Vegetarian Pizza",
    description: "Fresh vegetables with mozzarella cheese",
    category: "Pizza",
    price: 480,
    imageUrl:
      "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "12 inch",
  },

  // Pasta Category
  {
    name: "Spaghetti Carbonara",
    description: "Creamy pasta with bacon and parmesan",
    category: "Pasta",
    price: 380,
    imageUrl:
      "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "350g",
  },
  {
    name: "Chicken Alfredo",
    description: "Fettuccine with creamy alfredo sauce and grilled chicken",
    category: "Pasta",
    price: 420,
    imageUrl:
      "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "400g",
  },
  {
    name: "Penne Arrabiata",
    description: "Spicy tomato sauce with garlic and chili",
    category: "Pasta",
    price: 350,
    imageUrl:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "350g",
  },
  {
    name: "Lasagna",
    description: "Layered pasta with meat sauce and cheese",
    category: "Pasta",
    price: 480,
    imageUrl:
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "450g",
  },

  // Salad Category
  {
    name: "Caesar Salad",
    description: "Romaine lettuce with caesar dressing and croutons",
    category: "Salad",
    price: 220,
    imageUrl:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "250g",
  },
  {
    name: "Greek Salad",
    description: "Fresh vegetables with feta cheese and olives",
    category: "Salad",
    price: 240,
    imageUrl:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "280g",
  },
  {
    name: "Chicken Salad",
    description: "Grilled chicken with mixed greens and vinaigrette",
    category: "Salad",
    price: 280,
    imageUrl:
      "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300g",
  },

  // Rice Category
  {
    name: "Chicken Biryani",
    description: "Aromatic basmati rice with spiced chicken",
    category: "Rice",
    price: 320,
    imageUrl:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "400g",
  },
  {
    name: "Beef Biryani",
    description: "Fragrant rice with tender beef pieces",
    category: "Rice",
    price: 380,
    imageUrl:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "400g",
  },
  {
    name: "Fried Rice",
    description: "Stir-fried rice with vegetables and egg",
    category: "Rice",
    price: 250,
    imageUrl:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "350g",
  },
  {
    name: "Vegetable Pulao",
    description: "Aromatic rice with mixed vegetables",
    category: "Rice",
    price: 220,
    imageUrl:
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "350g",
  },

  // Sandwich Category
  {
    name: "Club Sandwich",
    description: "Triple-decker with chicken, bacon, lettuce, and tomato",
    category: "Sandwich",
    price: 280,
    imageUrl:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300g",
  },
  {
    name: "Grilled Cheese Sandwich",
    description: "Melted cheese between toasted bread",
    category: "Sandwich",
    price: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "200g",
  },
  {
    name: "BLT Sandwich",
    description: "Bacon, lettuce, and tomato with mayo",
    category: "Sandwich",
    price: 240,
    imageUrl:
      "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "250g",
  },

  // Appetizers
  {
    name: "French Fries",
    description: "Crispy golden fries with ketchup",
    category: "Appetizer",
    price: 120,
    imageUrl:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "200g",
  },
  {
    name: "Onion Rings",
    description: "Crispy battered onion rings",
    category: "Appetizer",
    price: 140,
    imageUrl:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "180g",
  },
  {
    name: "Mozzarella Sticks",
    description: "Fried mozzarella with marinara sauce",
    category: "Appetizer",
    price: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "200g",
  },
  {
    name: "Spring Rolls",
    description: "Crispy vegetable spring rolls",
    category: "Appetizer",
    price: 160,
    imageUrl:
      "https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "150g",
  },

  // More Drinks
  {
    name: "Lemonade",
    description: "Fresh squeezed lemonade",
    category: "Drink",
    price: 100,
    imageUrl:
      "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9f?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "350ml",
  },
  {
    name: "Strawberry Shake",
    description: "Creamy strawberry milkshake",
    category: "Drink",
    price: 160,
    imageUrl:
      "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "400ml",
  },
  {
    name: "Green Tea",
    description: "Hot or iced green tea",
    category: "Drink",
    price: 80,
    imageUrl:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "300ml",
  },

  // More Desserts
  {
    name: "Tiramisu",
    description: "Italian coffee-flavored dessert",
    category: "Dessert",
    price: 240,
    imageUrl:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "150g",
  },
  {
    name: "Apple Pie",
    description: "Warm apple pie with vanilla ice cream",
    category: "Dessert",
    price: 200,
    imageUrl:
      "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "180g",
  },
  {
    name: "Panna Cotta",
    description: "Italian cream dessert with berry sauce",
    category: "Dessert",
    price: 220,
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop",
    isAvailable: true,
    weight: "150g",
  },
];

// Additional Recipes (20+ recipes)
const additionalRecipes = [
  {
    name: "Chicken Tikka Masala",
    description: "Creamy tomato-based curry with tender chicken pieces",
    category: "Chicken",
    imageUrl:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop",
    ingredients: [
      "500g chicken breast",
      "1 cup yogurt",
      "2 tbsp tikka masala spice",
      "1 can tomato sauce",
      "1 cup heavy cream",
      "2 onions, diced",
      "4 garlic cloves",
      "1 inch ginger",
      "Salt to taste",
      "Fresh cilantro",
    ],
    steps: [
      "Marinate chicken in yogurt and spices for 2 hours",
      "Grill or pan-fry chicken until cooked",
      "Sauté onions, garlic, and ginger",
      "Add tomato sauce and spices",
      "Add cream and simmer for 10 minutes",
      "Add cooked chicken and simmer for 5 minutes",
      "Garnish with cilantro and serve with rice or naan",
    ],
    prepTime: 30,
    cookTime: 40,
    servings: 4,
  },
  {
    name: "Beef Stroganoff",
    description: "Tender beef in creamy mushroom sauce",
    category: "Beef",
    imageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop",
    ingredients: [
      "500g beef strips",
      "200g mushrooms, sliced",
      "1 onion, diced",
      "2 cups beef broth",
      "1 cup sour cream",
      "2 tbsp flour",
      "2 tbsp butter",
      "Salt and pepper",
      "Fresh parsley",
    ],
    steps: [
      "Season beef with salt and pepper",
      "Sear beef in hot pan, set aside",
      "Sauté onions and mushrooms in butter",
      "Add flour and stir for 1 minute",
      "Add beef broth and simmer until thickened",
      "Return beef to pan",
      "Stir in sour cream",
      "Serve over egg noodles or rice",
    ],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
  },
  {
    name: "Grilled Salmon with Lemon Butter",
    description: "Fresh salmon fillet with herb butter sauce",
    category: "Fish",
    imageUrl:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop",
    ingredients: [
      "4 salmon fillets",
      "4 tbsp butter",
      "2 lemons",
      "3 garlic cloves, minced",
      "Fresh dill",
      "Salt and pepper",
      "Olive oil",
    ],
    steps: [
      "Season salmon with salt and pepper",
      "Brush with olive oil",
      "Grill for 4-5 minutes per side",
      "Melt butter with garlic and lemon juice",
      "Add fresh dill to butter sauce",
      "Pour sauce over grilled salmon",
      "Serve with vegetables",
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 4,
  },
  {
    name: "Vegetable Stir Fry",
    description: "Colorful mixed vegetables in savory sauce",
    category: "Vegetarian",
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop",
    ingredients: [
      "2 cups broccoli florets",
      "1 bell pepper, sliced",
      "1 carrot, julienned",
      "1 cup snap peas",
      "3 tbsp soy sauce",
      "2 tbsp oyster sauce",
      "1 tbsp sesame oil",
      "2 garlic cloves",
      "1 inch ginger",
      "Sesame seeds",
    ],
    steps: [
      "Heat oil in wok or large pan",
      "Stir-fry garlic and ginger",
      "Add harder vegetables first (carrots, broccoli)",
      "Add softer vegetables (peppers, snap peas)",
      "Mix soy sauce and oyster sauce",
      "Pour sauce over vegetables",
      "Toss until coated and tender-crisp",
      "Garnish with sesame seeds",
    ],
    prepTime: 15,
    cookTime: 10,
    servings: 4,
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center",
    category: "Dessert",
    imageUrl:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop",
    ingredients: [
      "200g dark chocolate",
      "100g butter",
      "2 eggs",
      "2 egg yolks",
      "1/4 cup sugar",
      "2 tbsp flour",
      "Pinch of salt",
      "Vanilla ice cream",
    ],
    steps: [
      "Preheat oven to 425°F (220°C)",
      "Melt chocolate and butter together",
      "Whisk eggs, yolks, and sugar until thick",
      "Fold in melted chocolate",
      "Add flour and salt",
      "Pour into greased ramekins",
      "Bake for 12-14 minutes",
      "Serve immediately with ice cream",
    ],
    prepTime: 15,
    cookTime: 14,
    servings: 4,
  },
];

async function seedMoreData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Add more menu items
    console.log("📦 Adding more menu items...");
    const menuResult = await MenuItem.insertMany(additionalMenuItems);
    console.log(`✅ Added ${menuResult.length} new menu items`);

    // Show menu items by category
    const allMenuItems = await MenuItem.find();
    const menuCategories = {};
    allMenuItems.forEach((item) => {
      menuCategories[item.category] = (menuCategories[item.category] || 0) + 1;
    });

    console.log("\n📊 Total Menu Items by Category:");
    console.log("─".repeat(50));
    Object.entries(menuCategories)
      .sort()
      .forEach(([cat, count]) => {
        console.log(`${cat}: ${count} items`);
      });
    console.log("─".repeat(50));
    console.log(`Total Menu Items: ${allMenuItems.length}\n`);

    // Add more recipes
    console.log("📖 Adding more recipes...");
    const recipeResult = await Recipe.insertMany(additionalRecipes);
    console.log(`✅ Added ${recipeResult.length} new recipes`);

    // Show recipes by category
    const allRecipes = await Recipe.find();
    const recipeCategories = {};
    allRecipes.forEach((recipe) => {
      recipeCategories[recipe.category] =
        (recipeCategories[recipe.category] || 0) + 1;
    });

    console.log("\n📊 Total Recipes by Category:");
    console.log("─".repeat(50));
    Object.entries(recipeCategories)
      .sort()
      .forEach(([cat, count]) => {
        console.log(`${cat}: ${count} recipes`);
      });
    console.log("─".repeat(50));
    console.log(`Total Recipes: ${allRecipes.length}\n`);

    console.log("🎉 All additional data has been seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedMoreData();
