// Seed More Recipes Script
// Run: node seed-more-recipes.js

require("dotenv").config();
const mongoose = require("mongoose");
const Recipe = require("./src/models/Recipe");

const moreRecipes = [
  // Chicken Recipes
  {
    name: "Butter Chicken",
    category: "Chicken",
    description:
      "Creamy and rich North Indian curry with tender chicken pieces",
    ingredients: [
      "800g chicken breast, cubed",
      "1 cup yogurt",
      "2 tbsp butter",
      "1 cup heavy cream",
      "3 tomatoes, pureed",
      "2 onions, chopped",
      "4 cloves garlic",
      "1 inch ginger",
      "2 tsp garam masala",
      "1 tsp turmeric",
      "1 tsp red chili powder",
      "Salt to taste",
      "Fresh cilantro for garnish",
    ],
    instructions: [
      "Marinate chicken in yogurt, turmeric, and salt for 30 minutes",
      "Grill or pan-fry chicken until slightly charred",
      "In a pan, melt butter and sauté onions, garlic, and ginger",
      "Add tomato puree and spices, cook for 10 minutes",
      "Add cream and cooked chicken, simmer for 15 minutes",
      "Garnish with cilantro and serve with naan or rice",
    ],
    prepTime: 30,
    cookingTime: 45,
    servings: 6,
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
    spiceLevel: "Medium",
    isHalal: true,
  },
  {
    name: "Chicken Tikka Masala",
    category: "Chicken",
    description:
      "Popular British-Indian dish with grilled chicken in spiced curry sauce",
    ingredients: [
      "1kg chicken thighs, cubed",
      "1 cup yogurt",
      "2 tbsp tikka masala spice",
      "1 can tomato sauce",
      "1 cup heavy cream",
      "2 onions, diced",
      "4 cloves garlic, minced",
      "1 inch ginger, grated",
      "2 tsp cumin",
      "2 tsp paprika",
      "1 tsp turmeric",
      "Fresh cilantro",
    ],
    instructions: [
      "Marinate chicken in yogurt and tikka masala for 2 hours",
      "Grill chicken until charred and cooked through",
      "Sauté onions, garlic, and ginger until golden",
      "Add spices and tomato sauce, cook for 10 minutes",
      "Add cream and grilled chicken, simmer for 20 minutes",
      "Garnish with cilantro and serve hot",
    ],
    prepTime: 120,
    cookingTime: 40,
    servings: 6,
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641",
    spiceLevel: "Medium",
    isHalal: true,
  },
  {
    name: "Chicken Fried Rice",
    category: "Chicken",
    description:
      "Quick and easy Asian-style fried rice with chicken and vegetables",
    ingredients: [
      "3 cups cooked rice (day-old)",
      "400g chicken breast, diced",
      "2 eggs, beaten",
      "1 cup mixed vegetables (peas, carrots, corn)",
      "3 tbsp soy sauce",
      "2 tbsp oyster sauce",
      "3 cloves garlic, minced",
      "2 green onions, chopped",
      "2 tbsp vegetable oil",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Heat oil in a wok or large pan over high heat",
      "Cook chicken until golden, remove and set aside",
      "Scramble eggs in the same pan, remove and set aside",
      "Stir-fry garlic and vegetables for 2 minutes",
      "Add rice, breaking up clumps, stir-fry for 3 minutes",
      "Add chicken, eggs, soy sauce, and oyster sauce",
      "Toss everything together, garnish with green onions",
    ],
    prepTime: 15,
    cookingTime: 15,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
    spiceLevel: "Mild",
  },

  // Beef Recipes
  {
    name: "Beef Tacos",
    category: "Beef",
    description:
      "Mexican-style tacos with seasoned ground beef and fresh toppings",
    ingredients: [
      "500g ground beef",
      "8 taco shells",
      "1 packet taco seasoning",
      "1 cup shredded lettuce",
      "1 cup diced tomatoes",
      "1 cup shredded cheese",
      "1/2 cup sour cream",
      "1/2 cup salsa",
      "1 onion, diced",
      "2 cloves garlic, minced",
      "Lime wedges for serving",
    ],
    instructions: [
      "Brown ground beef with onions and garlic",
      "Add taco seasoning and water, simmer for 10 minutes",
      "Warm taco shells according to package directions",
      "Fill shells with seasoned beef",
      "Top with lettuce, tomatoes, cheese, sour cream, and salsa",
      "Serve with lime wedges",
    ],
    prepTime: 10,
    cookingTime: 20,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47",
    spiceLevel: "Medium",
  },
  {
    name: "Beef Stir Fry",
    category: "Beef",
    description:
      "Quick Asian-style stir fry with tender beef and crisp vegetables",
    ingredients: [
      "500g beef sirloin, thinly sliced",
      "2 cups mixed vegetables (broccoli, bell peppers, carrots)",
      "3 tbsp soy sauce",
      "2 tbsp oyster sauce",
      "1 tbsp cornstarch",
      "3 cloves garlic, minced",
      "1 inch ginger, grated",
      "2 tbsp vegetable oil",
      "1 tsp sesame oil",
      "Sesame seeds for garnish",
    ],
    instructions: [
      "Marinate beef in soy sauce and cornstarch for 15 minutes",
      "Heat oil in wok over high heat",
      "Stir-fry beef until browned, remove and set aside",
      "Stir-fry garlic, ginger, and vegetables for 3 minutes",
      "Return beef to wok, add oyster sauce and sesame oil",
      "Toss everything together, garnish with sesame seeds",
    ],
    prepTime: 20,
    cookingTime: 10,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
    spiceLevel: "Mild",
  },

  // Fish Recipes
  {
    name: "Grilled Salmon",
    category: "Fish",
    description: "Perfectly grilled salmon with lemon and herbs",
    ingredients: [
      "4 salmon fillets (6 oz each)",
      "2 lemons",
      "3 tbsp olive oil",
      "4 cloves garlic, minced",
      "2 tbsp fresh dill, chopped",
      "1 tbsp fresh parsley, chopped",
      "Salt and pepper to taste",
      "Lemon wedges for serving",
    ],
    instructions: [
      "Mix olive oil, garlic, dill, parsley, lemon juice, salt, and pepper",
      "Marinate salmon for 30 minutes",
      "Preheat grill to medium-high heat",
      "Grill salmon skin-side down for 4-5 minutes",
      "Flip and grill for another 3-4 minutes until cooked through",
      "Serve with lemon wedges and fresh herbs",
    ],
    prepTime: 35,
    cookingTime: 10,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288",
    spiceLevel: "None",
  },
  {
    name: "Fish and Chips",
    category: "Fish",
    description:
      "Classic British dish with crispy battered fish and golden fries",
    ingredients: [
      "4 white fish fillets (cod or haddock)",
      "1 cup all-purpose flour",
      "1 cup beer or sparkling water",
      "1 tsp baking powder",
      "4 large potatoes, cut into fries",
      "Oil for deep frying",
      "Salt and pepper",
      "Lemon wedges",
      "Tartar sauce for serving",
    ],
    instructions: [
      "Cut potatoes into fries and soak in cold water for 30 minutes",
      "Make batter by mixing flour, beer, baking powder, salt, and pepper",
      "Heat oil to 350°F (175°C)",
      "Fry potatoes until golden, drain and set aside",
      "Dip fish in batter and deep fry until golden brown (4-5 minutes)",
      "Serve fish and chips with lemon wedges and tartar sauce",
    ],
    prepTime: 40,
    cookingTime: 20,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1579208575657-c595a05383b7",
    spiceLevel: "None",
  },

  // Soup Recipes
  {
    name: "Chicken Noodle Soup",
    category: "Soup",
    description:
      "Comforting homemade soup with chicken, vegetables, and noodles",
    ingredients: [
      "500g chicken breast",
      "8 cups chicken broth",
      "2 cups egg noodles",
      "2 carrots, sliced",
      "2 celery stalks, sliced",
      "1 onion, diced",
      "3 cloves garlic, minced",
      "2 bay leaves",
      "1 tsp thyme",
      "Salt and pepper to taste",
      "Fresh parsley for garnish",
    ],
    instructions: [
      "In a large pot, bring chicken broth to a boil",
      "Add chicken breast and simmer for 20 minutes until cooked",
      "Remove chicken, shred, and set aside",
      "Add carrots, celery, onion, garlic, bay leaves, and thyme to broth",
      "Simmer for 15 minutes until vegetables are tender",
      "Add noodles and cook for 8 minutes",
      "Return shredded chicken to pot, season with salt and pepper",
      "Garnish with fresh parsley and serve hot",
    ],
    prepTime: 15,
    cookingTime: 45,
    servings: 6,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
    spiceLevel: "None",
  },
  {
    name: "Tom Yum Soup",
    category: "Soup",
    description: "Spicy and sour Thai soup with shrimp and mushrooms",
    ingredients: [
      "500g shrimp, peeled and deveined",
      "6 cups chicken or vegetable broth",
      "200g mushrooms, sliced",
      "3 stalks lemongrass, bruised",
      "4 kaffir lime leaves",
      "3 Thai chilies, crushed",
      "3 tbsp fish sauce",
      "2 tbsp lime juice",
      "1 tbsp sugar",
      "2 tomatoes, quartered",
      "Fresh cilantro for garnish",
    ],
    instructions: [
      "Bring broth to a boil with lemongrass and lime leaves",
      "Add mushrooms and simmer for 5 minutes",
      "Add shrimp and cook until pink (3-4 minutes)",
      "Add tomatoes, chilies, fish sauce, lime juice, and sugar",
      "Simmer for 2 minutes",
      "Remove lemongrass and lime leaves",
      "Garnish with cilantro and serve hot",
    ],
    prepTime: 15,
    cookingTime: 20,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
    spiceLevel: "Hot",
  },

  // Dessert Recipes
  {
    name: "Tiramisu",
    category: "Dessert",
    description:
      "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
    ingredients: [
      "6 egg yolks",
      "3/4 cup sugar",
      "500g mascarpone cheese",
      "1 1/2 cups strong espresso, cooled",
      "3 tbsp coffee liqueur (optional)",
      "24 ladyfinger cookies",
      "Cocoa powder for dusting",
      "Dark chocolate shavings",
    ],
    instructions: [
      "Whisk egg yolks and sugar until thick and pale",
      "Add mascarpone and mix until smooth",
      "Mix espresso with coffee liqueur in a shallow dish",
      "Quickly dip ladyfingers in coffee mixture",
      "Layer half the ladyfingers in a dish",
      "Spread half the mascarpone mixture over ladyfingers",
      "Repeat layers",
      "Refrigerate for at least 4 hours or overnight",
      "Dust with cocoa powder and chocolate shavings before serving",
    ],
    prepTime: 30,
    cookingTime: 0,
    servings: 8,
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
    spiceLevel: "None",
    isVegetarian: true,
  },
  {
    name: "Apple Pie",
    category: "Dessert",
    description:
      "Classic American apple pie with flaky crust and cinnamon apples",
    ingredients: [
      "2 pie crusts (store-bought or homemade)",
      "6 large apples, peeled and sliced",
      "3/4 cup sugar",
      "2 tbsp all-purpose flour",
      "1 tsp cinnamon",
      "1/4 tsp nutmeg",
      "2 tbsp butter",
      "1 egg, beaten (for egg wash)",
      "Vanilla ice cream for serving",
    ],
    instructions: [
      "Preheat oven to 375°F (190°C)",
      "Mix apples, sugar, flour, cinnamon, and nutmeg",
      "Place one pie crust in a 9-inch pie dish",
      "Fill with apple mixture and dot with butter",
      "Cover with second crust, seal edges, and cut vents",
      "Brush with egg wash",
      "Bake for 45-50 minutes until golden brown",
      "Cool for at least 2 hours before serving",
      "Serve with vanilla ice cream",
    ],
    prepTime: 30,
    cookingTime: 50,
    servings: 8,
    imageUrl: "https://images.unsplash.com/photo-1535920527002-b35e96722eb9",
    spiceLevel: "None",
    isVegetarian: true,
  },

  // Vegetarian Recipes
  {
    name: "Vegetable Curry",
    category: "Vegetarian",
    description: "Hearty Indian curry with mixed vegetables in coconut milk",
    ingredients: [
      "2 cups mixed vegetables (potatoes, carrots, peas, cauliflower)",
      "1 can coconut milk",
      "2 tomatoes, diced",
      "1 onion, chopped",
      "3 cloves garlic, minced",
      "1 inch ginger, grated",
      "2 tbsp curry powder",
      "1 tsp cumin",
      "1 tsp turmeric",
      "1 tsp garam masala",
      "2 tbsp vegetable oil",
      "Fresh cilantro",
      "Salt to taste",
    ],
    instructions: [
      "Heat oil and sauté onions, garlic, and ginger until fragrant",
      "Add curry powder, cumin, and turmeric, cook for 1 minute",
      "Add tomatoes and cook until soft",
      "Add vegetables and coconut milk, bring to a boil",
      "Reduce heat and simmer for 20 minutes until vegetables are tender",
      "Add garam masala and salt",
      "Garnish with cilantro and serve with rice or naan",
    ],
    prepTime: 15,
    cookingTime: 30,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe",
    spiceLevel: "Medium",
    isVegetarian: true,
    isVegan: true,
  },
  {
    name: "Caprese Salad",
    category: "Vegetarian",
    description: "Fresh Italian salad with tomatoes, mozzarella, and basil",
    ingredients: [
      "4 large tomatoes, sliced",
      "400g fresh mozzarella, sliced",
      "Fresh basil leaves",
      "3 tbsp extra virgin olive oil",
      "2 tbsp balsamic vinegar",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Arrange tomato and mozzarella slices alternately on a platter",
      "Tuck basil leaves between slices",
      "Drizzle with olive oil and balsamic vinegar",
      "Season with salt and pepper",
      "Let sit for 10 minutes before serving",
      "Serve at room temperature",
    ],
    prepTime: 15,
    cookingTime: 0,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1608897013039-887f21d8c804",
    spiceLevel: "None",
    isVegetarian: true,
  },

  // Rice Recipes
  {
    name: "Shrimp Fried Rice",
    category: "Rice",
    description: "Delicious fried rice with succulent shrimp and vegetables",
    ingredients: [
      "3 cups cooked rice (day-old)",
      "300g shrimp, peeled and deveined",
      "2 eggs, beaten",
      "1 cup mixed vegetables",
      "3 tbsp soy sauce",
      "2 tbsp oyster sauce",
      "3 cloves garlic, minced",
      "2 green onions, chopped",
      "2 tbsp vegetable oil",
      "Sesame oil for drizzling",
    ],
    instructions: [
      "Heat oil in wok over high heat",
      "Cook shrimp until pink, remove and set aside",
      "Scramble eggs, remove and set aside",
      "Stir-fry garlic and vegetables for 2 minutes",
      "Add rice, breaking up clumps",
      "Add shrimp, eggs, soy sauce, and oyster sauce",
      "Toss everything together, drizzle with sesame oil",
      "Garnish with green onions",
    ],
    prepTime: 15,
    cookingTime: 15,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
    spiceLevel: "Mild",
  },
  {
    name: "Spanish Paella",
    category: "Rice",
    description: "Traditional Spanish rice dish with seafood and saffron",
    ingredients: [
      "2 cups paella rice",
      "4 cups chicken broth",
      "300g shrimp",
      "300g mussels",
      "200g chorizo, sliced",
      "1 onion, diced",
      "4 cloves garlic, minced",
      "2 tomatoes, diced",
      "1 red bell pepper, sliced",
      "1/2 tsp saffron threads",
      "1 tsp paprika",
      "1/4 cup olive oil",
      "Lemon wedges",
      "Fresh parsley",
    ],
    instructions: [
      "Heat olive oil in a large paella pan",
      "Cook chorizo until crispy, remove and set aside",
      "Sauté onion, garlic, and bell pepper until soft",
      "Add tomatoes and cook for 5 minutes",
      "Add rice, paprika, and saffron, stir to coat",
      "Pour in hot broth, arrange seafood and chorizo on top",
      "Cook without stirring for 20-25 minutes",
      "Let rest for 5 minutes, garnish with parsley and lemon",
    ],
    prepTime: 20,
    cookingTime: 35,
    servings: 6,
    imageUrl: "https://images.unsplash.com/photo-1534080564583-6be75777b70a",
    spiceLevel: "Mild",
  },
];

async function seedMoreRecipes() {
  try {
    console.log("🌱 Starting to seed more recipes...\n");

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    console.log("📖 Adding recipes...");

    let addedCount = 0;
    let skippedCount = 0;

    for (const recipe of moreRecipes) {
      // Check if recipe already exists
      const exists = await Recipe.findOne({ name: recipe.name });

      if (exists) {
        console.log(`⏭️  Skipped: ${recipe.name} (already exists)`);
        skippedCount++;
      } else {
        await Recipe.create(recipe);
        console.log(`✅ Added: ${recipe.name}`);
        addedCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("\n🎉 Recipe seeding completed!\n");
    console.log(`📊 Summary:`);
    console.log(`   ✅ Added: ${addedCount} recipes`);
    console.log(`   ⏭️  Skipped: ${skippedCount} recipes (already existed)`);
    console.log(
      `   📖 Total in database: ${await Recipe.countDocuments()} recipes\n`,
    );

    console.log("🍽️  New recipes by category:");
    const categories = await Recipe.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    categories.forEach((cat) => {
      console.log(`   ${cat._id}: ${cat.count} recipes`);
    });

    console.log(
      "\n✨ You can now view these recipes at: https://foodbuzz-api.vercel.app/api/recipes\n",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding recipes:", error);
    process.exit(1);
  }
}

// Run the seeder
seedMoreRecipes();
