# Seed Sample Recipes

This script adds 12 professional sample recipes with proper images for showcasing your project.

## Recipes Included:

### Chicken (2 recipes)

- Classic Chicken Biryani
- Butter Chicken

### Beef (2 recipes)

- Spicy Beef Curry
- Beef Steak with Mushroom Sauce

### Fish (2 recipes)

- Grilled Fish with Lemon Butter
- Salmon Teriyaki

### Soup (2 recipes)

- Creamy Tomato Soup
- Minestrone Soup

### Dessert (2 recipes)

- Chocolate Lava Cake
- Tiramisu

### Drink (2 recipes)

- Fresh Mango Smoothie
- Iced Coffee Frappe

## How to Run:

```bash
# From the Server directory
cd Server
node seed-recipes.js
```

## What it does:

1. Connects to your MongoDB database
2. Clears all existing recipes
3. Adds 12 new recipes with:
   - Professional descriptions
   - High-quality Unsplash images
   - Complete ingredients lists
   - Step-by-step instructions
   - Prep time, cooking time, servings, calories
   - Required tools

## After Running:

- Visit `http://localhost:5173/recipes` to see all recipes
- Visit `http://localhost:5173/recipes/trending` to see trending recipes
- Visit `http://localhost:5173/recipes/recent` to see recent recipes
- Use the new Recipes dropdown menu in the navbar!

All recipes have proper images from Unsplash and look professional for showcasing your project! 🎉
