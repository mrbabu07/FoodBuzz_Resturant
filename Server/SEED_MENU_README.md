# Menu Items Seed Script

## How to Run

1. Open terminal in the `Server` directory:

   ```bash
   cd Server
   ```

2. Run the seed script:
   ```bash
   node seed-menu-items.js
   ```

## What This Does

- Clears all existing menu items from the database
- Inserts 23 professional menu items with:
  - **Beef** (3 items): Burger, Steak, Tacos
  - **Chicken** (4 items): Fried Chicken, Grilled Breast, Tikka Masala, Buffalo Wings
  - **Fish** (3 items): Grilled Salmon, Fish & Chips, Tuna Poke Bowl
  - **Soup** (3 items): Tomato Soup, Chicken Noodle, Tom Yum
  - **Dessert** (4 items): Lava Cake, Cheesecake, Tiramisu, Mango Sticky Rice
  - **Drink** (6 items): Orange Juice, Mango Smoothie, Iced Coffee, Milkshake, Green Tea, Lemonade

## Features

Each menu item includes:

- High-quality Unsplash images
- Detailed descriptions
- Calorie information
- Allergen information
- Dietary preferences (Vegetarian, Vegan, Gluten-Free, Halal, etc.)
- Spice level indicators
- Proper pricing

## After Running

Visit `http://localhost:5173/order_1st` to see the beautiful menu with all items!
