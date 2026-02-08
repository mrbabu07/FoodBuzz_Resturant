# 🍳 Extended Recipe Seeding Guide

## Overview

This script adds **40+ additional recipes** to your database, bringing the total to **52+ recipes**.

---

## 📊 What's Included

### Recipe Distribution (40 new recipes)

- **Chicken** (8): Parmesan, Honey Garlic, Quesadilla, Noodle Stir Fry, Lemon Herb Roasted, Enchiladas, Caesar Salad, Satay
- **Beef** (8): Tacos, Stroganoff, Bulgogi, Lasagna, Chili, Kebabs, Pho, Wellington
- **Fish** (8): Fish Tacos, Baked Cod, Tuna Poke Bowl, Shrimp Scampi, Grilled Mahi Mahi, Seafood Paella, Fish & Chips, Blackened Tilapia
- **Soup** (8): French Onion, Tom Yum, Butternut Squash, Clam Chowder, Lentil, Wonton, Gazpacho, Split Pea
- **Dessert** (8): Cheesecake, Crème Brûlée, Apple Pie, Panna Cotta, Brownies, Lemon Tart, Chocolate Mousse, Banana Foster

---

## 🚀 How to Run

### Option 1: Run All Seeds (Recommended)

```bash
cd Server
node seed-all.js
```

This will seed:

1. Menu items (23)
2. Initial recipes (12)
3. **More recipes (40)** ← This script
4. Offers (6)

### Option 2: Run Only This Script

```bash
cd Server
node seed-more-recipes.js
```

**Note:** This adds to existing recipes. Run `seed-recipes.js` first if you haven't already.

---

## ✨ Features

Each recipe includes:

- ✅ **Name** - Descriptive recipe name
- ✅ **Category** - Chicken, Beef, Fish, Soup, Dessert
- ✅ **Description** - Brief overview
- ✅ **High-quality images** - Professional Unsplash photos
- ✅ **Ingredients list** - Complete ingredient list
- ✅ **Instructions** - Step-by-step cooking instructions
- ✅ **Prep time** - Time to prepare ingredients
- ✅ **Cooking time** - Time to cook
- ✅ **Servings** - Number of servings
- ✅ **Calories** - Nutritional information
- ✅ **Difficulty** - Easy, Medium, or Hard (where applicable)

---

## 📈 Total Recipe Count

After running all seed scripts:

| Category  | Initial | Additional | **Total** |
| --------- | ------- | ---------- | --------- |
| Chicken   | 2       | 8          | **10**    |
| Beef      | 2       | 8          | **10**    |
| Fish      | 2       | 8          | **10**    |
| Soup      | 2       | 8          | **10**    |
| Dessert   | 2       | 8          | **10**    |
| Drink     | 2       | 0          | **2**     |
| **TOTAL** | **12**  | **40**     | **52**    |

---

## 🎯 What This Enables

With 52+ recipes, your FoodBuzz platform now has:

1. **Rich Content** - Extensive recipe library for users
2. **Better Browsing** - More options in each category
3. **Trending Section** - Enough recipes for meaningful trending
4. **Search Results** - More results for search queries
5. **Professional Showcase** - Impressive portfolio demonstration

---

## 🔍 Verify Seeding

After running the script, check the database:

```bash
# In MongoDB shell or Compass
use foodbuzz
db.recipes.countDocuments()  # Should show 52+

# Count by category
db.recipes.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } }
])
```

Or visit your application:

- **All Recipes**: http://localhost:5173/recipes
- **Trending**: http://localhost:5173/recipes/trending
- **Recent**: http://localhost:5173/recipes/recent

---

## 🎨 Recipe Highlights

### Popular Additions

**Chicken:**

- Chicken Parmesan - Italian classic
- Honey Garlic Chicken - Sweet & savory
- Chicken Satay - Thai favorite

**Beef:**

- Korean Bulgogi - Asian fusion
- Beef Wellington - Elegant dish
- Beef Pho - Vietnamese comfort food

**Fish:**

- Tuna Poke Bowl - Hawaiian style
- Seafood Paella - Spanish specialty
- Shrimp Scampi - Italian-American

**Soup:**

- French Onion Soup - Classic comfort
- Tom Yum - Thai hot & sour
- Clam Chowder - New England style

**Dessert:**

- Crème Brûlée - French elegance
- New York Cheesecake - American classic
- Tiramisu - Italian favorite

---

## 🛠️ Troubleshooting

### Script Fails

```bash
# Make sure MongoDB is connected
# Check MONGO_URI in .env file
# Ensure seed-recipes.js ran first
```

### Duplicate Recipes

```bash
# Clear all recipes first
node -e "require('./src/models/Recipe').deleteMany({}).then(() => console.log('Cleared'))"

# Then run seeds again
node seed-recipes.js
node seed-more-recipes.js
```

### Images Not Loading

- Images use Unsplash URLs (requires internet)
- Fallback images are configured in frontend
- Check browser console for errors

---

## 📝 Customization

Want to add your own recipes? Edit `seed-more-recipes.js`:

```javascript
{
  name: "Your Recipe Name",
  category: "Chicken", // or Beef, Fish, Soup, Dessert, Drink
  description: "Brief description",
  imageUrl: "https://images.unsplash.com/...",
  prepTime: 15,
  cookingTime: 30,
  servings: 4,
  calories: 400,
  ingredients: ["ingredient 1", "ingredient 2"],
  instructions: ["step 1", "step 2"]
}
```

---

## 🎉 Success!

After running this script, your FoodBuzz platform will have:

- ✅ 52+ professional recipes
- ✅ 10 recipes per major category
- ✅ Rich content for browsing
- ✅ Impressive portfolio showcase

**Your recipe database is now fully stocked!** 🍳🎊
