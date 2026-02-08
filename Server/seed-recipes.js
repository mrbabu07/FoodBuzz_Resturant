// seed-recipes.js - Add sample recipes with proper images for showcasing
const mongoose = require("mongoose");
require("dotenv").config();

const Recipe = require("./src/models/Recipe");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/foodbuzz";

const sampleRecipes = [
  {
    name: "Classic Chicken Biryani",
    category: "Chicken",
    description:
      "Aromatic basmati rice layered with tender chicken, fragrant spices, and saffron. A royal dish that's perfect for special occasions.",
    imageUrl:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
    prepTime: 30,
    cookingTime: 45,
    servings: 6,
    calories: 450,
    ingredients: [
      "2 lbs chicken",
      "3 cups basmati rice",
      "2 onions, sliced",
      "4 tomatoes",
      "1 cup yogurt",
      "Biryani masala",
      "Saffron",
      "Ghee",
      "Fresh mint and coriander",
    ],
    tools: ["Large pot", "Frying pan", "Mixing bowl"],
    instructions: [
      "Marinate chicken with yogurt and spices for 30 minutes",
      "Fry onions until golden brown",
      "Cook rice until 70% done",
      "Layer rice and chicken alternately",
      "Add saffron milk and seal the pot",
      "Cook on low heat for 25 minutes",
      "Garnish with fried onions and serve hot",
    ],
  },
  {
    name: "Spicy Beef Curry",
    category: "Beef",
    description:
      "Rich and flavorful beef curry slow-cooked with aromatic spices. Perfect with rice or naan bread.",
    imageUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    prepTime: 20,
    cookingTime: 90,
    servings: 4,
    calories: 520,
    ingredients: [
      "1.5 lbs beef chunks",
      "2 onions, chopped",
      "3 tomatoes",
      "Ginger-garlic paste",
      "Curry spices",
      "Coconut milk",
      "Fresh cilantro",
    ],
    tools: ["Heavy pot", "Knife", "Cutting board"],
    instructions: [
      "Brown beef pieces in hot oil",
      "Sauté onions until soft",
      "Add ginger-garlic paste and spices",
      "Add tomatoes and cook until soft",
      "Return beef to pot with water",
      "Simmer for 1.5 hours until tender",
      "Add coconut milk and simmer 10 minutes",
      "Garnish with cilantro",
    ],
  },
  {
    name: "Grilled Fish with Lemon Butter",
    category: "Fish",
    description:
      "Fresh fish fillets grilled to perfection with a tangy lemon butter sauce. Light, healthy, and delicious!",
    imageUrl:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
    prepTime: 15,
    cookingTime: 20,
    servings: 4,
    calories: 280,
    ingredients: [
      "4 fish fillets",
      "4 tbsp butter",
      "2 lemons",
      "Garlic cloves",
      "Fresh parsley",
      "Salt and pepper",
      "Olive oil",
    ],
    tools: ["Grill or grill pan", "Small saucepan", "Tongs"],
    instructions: [
      "Season fish with salt, pepper, and olive oil",
      "Preheat grill to medium-high",
      "Grill fish 4-5 minutes per side",
      "Melt butter with garlic and lemon juice",
      "Drizzle lemon butter over fish",
      "Garnish with parsley and lemon slices",
    ],
  },
  {
    name: "Creamy Tomato Soup",
    category: "Soup",
    description:
      "Velvety smooth tomato soup with a hint of basil. Comfort food at its finest!",
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
    prepTime: 10,
    cookingTime: 30,
    servings: 4,
    calories: 180,
    ingredients: [
      "2 lbs ripe tomatoes",
      "1 onion, chopped",
      "3 garlic cloves",
      "1 cup heavy cream",
      "Fresh basil",
      "Vegetable stock",
      "Butter",
    ],
    tools: ["Large pot", "Blender", "Ladle"],
    instructions: [
      "Sauté onion and garlic in butter",
      "Add chopped tomatoes and stock",
      "Simmer for 20 minutes",
      "Blend until smooth",
      "Stir in cream and basil",
      "Season to taste",
      "Serve hot with croutons",
    ],
  },
  {
    name: "Chocolate Lava Cake",
    category: "Dessert",
    description:
      "Decadent chocolate cake with a molten center. The ultimate chocolate lover's dessert!",
    imageUrl:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    prepTime: 15,
    cookingTime: 12,
    servings: 4,
    calories: 420,
    ingredients: [
      "6 oz dark chocolate",
      "1/2 cup butter",
      "2 eggs",
      "2 egg yolks",
      "1/4 cup sugar",
      "2 tbsp flour",
      "Vanilla extract",
    ],
    tools: ["Ramekins", "Double boiler", "Whisk", "Oven"],
    instructions: [
      "Preheat oven to 425°F",
      "Melt chocolate and butter together",
      "Whisk eggs, yolks, and sugar until thick",
      "Fold in chocolate mixture",
      "Add flour and vanilla",
      "Pour into greased ramekins",
      "Bake 12 minutes",
      "Serve immediately with ice cream",
    ],
  },
  {
    name: "Fresh Mango Smoothie",
    category: "Drink",
    description:
      "Refreshing tropical smoothie made with ripe mangoes, yogurt, and a hint of cardamom.",
    imageUrl:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&q=80",
    prepTime: 5,
    cookingTime: 0,
    servings: 2,
    calories: 180,
    ingredients: [
      "2 ripe mangoes",
      "1 cup yogurt",
      "1/2 cup milk",
      "2 tbsp honey",
      "Cardamom powder",
      "Ice cubes",
    ],
    tools: ["Blender", "Glasses"],
    instructions: [
      "Peel and chop mangoes",
      "Add all ingredients to blender",
      "Blend until smooth",
      "Add ice and blend again",
      "Pour into glasses",
      "Garnish with mint leaves",
    ],
  },
  {
    name: "Butter Chicken",
    category: "Chicken",
    description:
      "Creamy, rich butter chicken in a tomato-based sauce. A restaurant favorite you can make at home!",
    imageUrl:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
    prepTime: 20,
    cookingTime: 40,
    servings: 4,
    calories: 480,
    ingredients: [
      "1.5 lbs chicken breast",
      "1 cup heavy cream",
      "4 tomatoes",
      "Butter",
      "Garam masala",
      "Kasuri methi",
      "Ginger-garlic paste",
    ],
    tools: ["Pan", "Blender", "Mixing bowl"],
    instructions: [
      "Marinate chicken in yogurt and spices",
      "Grill or pan-fry chicken pieces",
      "Make tomato gravy with butter and spices",
      "Add cream and kasuri methi",
      "Add chicken to gravy",
      "Simmer for 10 minutes",
      "Serve with naan or rice",
    ],
  },
  {
    name: "Beef Steak with Mushroom Sauce",
    category: "Beef",
    description:
      "Juicy beef steak topped with a rich mushroom cream sauce. Perfect for a special dinner!",
    imageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
    prepTime: 10,
    cookingTime: 20,
    servings: 2,
    calories: 550,
    ingredients: [
      "2 beef steaks",
      "8 oz mushrooms",
      "1 cup cream",
      "Garlic",
      "Thyme",
      "Butter",
      "Red wine",
    ],
    tools: ["Cast iron skillet", "Tongs", "Saucepan"],
    instructions: [
      "Season steaks with salt and pepper",
      "Sear steaks in hot pan 4 minutes per side",
      "Rest steaks while making sauce",
      "Sauté mushrooms and garlic",
      "Add wine and reduce",
      "Add cream and thyme",
      "Pour sauce over steaks",
    ],
  },
  {
    name: "Salmon Teriyaki",
    category: "Fish",
    description:
      "Glazed salmon with sweet and savory teriyaki sauce. Quick, easy, and absolutely delicious!",
    imageUrl:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    prepTime: 10,
    cookingTime: 15,
    servings: 4,
    calories: 320,
    ingredients: [
      "4 salmon fillets",
      "Soy sauce",
      "Mirin",
      "Brown sugar",
      "Ginger",
      "Garlic",
      "Sesame seeds",
    ],
    tools: ["Pan", "Brush", "Small bowl"],
    instructions: [
      "Mix teriyaki sauce ingredients",
      "Brush salmon with sauce",
      "Pan-fry salmon skin-side down",
      "Flip and brush with more sauce",
      "Cook until glazed",
      "Sprinkle with sesame seeds",
      "Serve with rice and vegetables",
    ],
  },
  {
    name: "Minestrone Soup",
    category: "Soup",
    description:
      "Hearty Italian vegetable soup with pasta and beans. Healthy and satisfying!",
    imageUrl:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    prepTime: 15,
    cookingTime: 35,
    servings: 6,
    calories: 220,
    ingredients: [
      "Mixed vegetables",
      "Cannellini beans",
      "Small pasta",
      "Tomatoes",
      "Vegetable stock",
      "Italian herbs",
      "Parmesan cheese",
    ],
    tools: ["Large pot", "Knife", "Ladle"],
    instructions: [
      "Sauté onions, carrots, and celery",
      "Add tomatoes and stock",
      "Add beans and vegetables",
      "Simmer for 20 minutes",
      "Add pasta and cook until tender",
      "Season with herbs",
      "Serve with parmesan",
    ],
  },
  {
    name: "Tiramisu",
    category: "Dessert",
    description:
      "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.",
    imageUrl:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
    prepTime: 30,
    cookingTime: 0,
    servings: 8,
    calories: 380,
    ingredients: [
      "Ladyfinger cookies",
      "Mascarpone cheese",
      "Eggs",
      "Sugar",
      "Strong coffee",
      "Cocoa powder",
      "Marsala wine",
    ],
    tools: ["Mixing bowls", "Whisk", "Baking dish"],
    instructions: [
      "Whip egg yolks with sugar",
      "Fold in mascarpone",
      "Whip egg whites and fold in",
      "Dip ladyfingers in coffee",
      "Layer cookies and cream",
      "Repeat layers",
      "Dust with cocoa",
      "Refrigerate 4 hours",
    ],
  },
  {
    name: "Iced Coffee Frappe",
    category: "Drink",
    description:
      "Refreshing blended coffee drink perfect for hot days. Better than any coffee shop!",
    imageUrl:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80",
    prepTime: 5,
    cookingTime: 0,
    servings: 2,
    calories: 150,
    ingredients: [
      "Strong brewed coffee",
      "Milk",
      "Ice cubes",
      "Sugar or sweetener",
      "Vanilla extract",
      "Whipped cream",
    ],
    tools: ["Blender", "Tall glasses"],
    instructions: [
      "Brew coffee and let cool",
      "Add coffee, milk, ice, and sugar to blender",
      "Blend until smooth and frothy",
      "Pour into glasses",
      "Top with whipped cream",
      "Drizzle with chocolate syrup",
    ],
  },
];

async function seedRecipes() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🗑️  Clearing existing recipes...");
    await Recipe.deleteMany({});
    console.log("✅ Cleared existing recipes");

    console.log("📝 Adding sample recipes...");
    const recipes = await Recipe.insertMany(sampleRecipes);
    console.log(`✅ Added ${recipes.length} recipes successfully!`);

    console.log("\n📊 Recipe Summary:");
    const categories = await Recipe.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    categories.forEach((cat) => {
      console.log(`   ${cat._id}: ${cat.count} recipes`);
    });

    console.log("\n🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding recipes:", error);
    process.exit(1);
  }
}

seedRecipes();
