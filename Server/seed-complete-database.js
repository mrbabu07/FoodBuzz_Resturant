// Complete Database Seeding Script
// Run: node seed-complete-database.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Models
const User = require("./src/models/User");
const MenuItem = require("./src/models/MenuItem");
const Recipe = require("./src/models/Recipe");
const Order = require("./src/models/Order");
const Review = require("./src/models/Review");
const Offer = require("./src/models/Offer");
const Notification = require("./src/models/Notification");
const FlashDeal = require("./src/models/FlashDeal");
const PromoBanner = require("./src/models/PromoBanner");
const Address = require("./src/models/Address");
const PointsTransaction = require("./src/models/PointsTransaction");

async function seedDatabase() {
  try {
    console.log("🌱 Starting complete database seeding...\n");

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      MenuItem.deleteMany({}),
      Recipe.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Offer.deleteMany({}),
      Notification.deleteMany({}),
      FlashDeal.deleteMany({}),
      PromoBanner.deleteMany({}),
      Address.deleteMany({}),
      PointsTransaction.deleteMany({}),
    ]);
    console.log("✅ Cleared existing data\n");

    // 1. Create Users
    console.log("👥 Creating users...");
    const passwordHash = await bcrypt.hash("password123", 10);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@foodbuzz.com",
      passwordHash,
      role: "admin",
      phone: "+8801712345678",
      address: "123 Admin Street, Dhaka",
      emailVerified: true,
      loyaltyPoints: {
        balance: 5000,
        totalEarned: 10000,
        totalRedeemed: 5000,
        tier: "platinum",
      },
    });

    const staff = await User.create({
      name: "Staff Member",
      email: "staff@foodbuzz.com",
      passwordHash,
      role: "staff",
      phone: "+8801712345679",
      address: "456 Staff Avenue, Dhaka",
      emailVerified: true,
    });

    const users = [];
    const userNames = [
      "John Doe",
      "Jane Smith",
      "Ahmed Rahman",
      "Fatima Khan",
      "Michael Chen",
      "Sarah Johnson",
      "Karim Hassan",
      "Ayesha Begum",
      "David Lee",
      "Maria Garcia",
    ];

    for (let i = 0; i < userNames.length; i++) {
      const user = await User.create({
        name: userNames[i],
        email: `user${i + 1}@example.com`,
        passwordHash,
        role: "user",
        phone: `+88017123456${80 + i}`,
        address: `${100 + i} User Street, Dhaka`,
        emailVerified: true,
        loyaltyPoints: {
          balance: Math.floor(Math.random() * 1000) + 100,
          totalEarned: Math.floor(Math.random() * 2000) + 500,
          totalRedeemed: Math.floor(Math.random() * 500),
          tier: ["bronze", "silver", "gold"][Math.floor(Math.random() * 3)],
        },
      });
      users.push(user);
    }

    console.log(`✅ Created ${users.length + 2} users\n`);

    // 2. Create Addresses
    console.log("📍 Creating addresses...");
    const addresses = [];
    for (const user of users.slice(0, 5)) {
      const address = await Address.create({
        userId: user._id,
        label: "home",
        fullName: user.name,
        street: `${Math.floor(Math.random() * 500)} Main Road`,
        addressLine1: `${Math.floor(Math.random() * 500)} Main Road`,
        area: ["Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur"][
          Math.floor(Math.random() * 5)
        ],
        city: "Dhaka",
        postalCode: `${1200 + Math.floor(Math.random() * 20)}`,
        phone: user.phone,
        isDefault: true,
      });
      addresses.push(address);
    }
    console.log(`✅ Created ${addresses.length} addresses\n`);

    // 3. Create Menu Items
    console.log("🍔 Creating menu items...");
    const menuCategories = {
      Chicken: [
        {
          name: "Classic Chicken Burger",
          details: "Crispy chicken fillet with mayo and fresh vegetables",
          price: 320,
          imageUrl:
            "https://images.unsplash.com/photo-1606755962773-d324e0a13086",
        },
        {
          name: "Grilled Chicken",
          details: "Tender grilled chicken with herbs and spices",
          price: 380,
          imageUrl:
            "https://images.unsplash.com/photo-1598103442097-8b74394b95c6",
        },
        {
          name: "Chicken Wings",
          details: "Crispy chicken wings with BBQ sauce",
          price: 280,
          imageUrl:
            "https://images.unsplash.com/photo-1527477396000-e27163b481c2",
        },
      ],
      Beef: [
        {
          name: "Classic Beef Burger",
          details:
            "Juicy beef patty with lettuce, tomato, onion, and special sauce",
          price: 350,
          imageUrl:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
        },
        {
          name: "Cheese Burger Deluxe",
          details: "Double beef patty with extra cheese and bacon",
          price: 450,
          imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349",
        },
        {
          name: "Beef Steak",
          details: "Premium beef steak with mushroom sauce",
          price: 650,
          imageUrl:
            "https://images.unsplash.com/photo-1600891964092-4316c288032e",
        },
      ],
      Pizza: [
        {
          name: "Margherita Pizza",
          details: "Classic tomato sauce, mozzarella, and fresh basil",
          price: 550,
          imageUrl:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
        },
        {
          name: "Pepperoni Pizza",
          details: "Loaded with pepperoni and extra cheese",
          price: 650,
          imageUrl:
            "https://images.unsplash.com/photo-1628840042765-356cda07504e",
        },
        {
          name: "BBQ Chicken Pizza",
          details: "BBQ sauce, grilled chicken, onions, and cilantro",
          price: 700,
          imageUrl:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
        },
      ],
      Pasta: [
        {
          name: "Spaghetti Carbonara",
          details: "Creamy pasta with bacon and parmesan",
          price: 420,
          imageUrl:
            "https://images.unsplash.com/photo-1612874742237-6526221588e3",
        },
        {
          name: "Penne Arrabiata",
          details: "Spicy tomato sauce with garlic and herbs",
          price: 380,
          imageUrl:
            "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9",
        },
        {
          name: "Fettuccine Alfredo",
          details: "Rich and creamy white sauce pasta",
          price: 450,
          imageUrl:
            "https://images.unsplash.com/photo-1645112411341-6c4fd023714a",
        },
      ],
      Rice: [
        {
          name: "Chicken Biryani",
          details: "Aromatic basmati rice with tender chicken pieces",
          price: 280,
          imageUrl:
            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8",
        },
        {
          name: "Beef Biryani",
          details: "Flavorful rice with succulent beef chunks",
          price: 320,
          imageUrl:
            "https://images.unsplash.com/photo-1633945274309-2c8c2b0e5e0e",
        },
        {
          name: "Vegetable Fried Rice",
          details: "Stir-fried rice with mixed vegetables",
          price: 220,
          imageUrl:
            "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
        },
        {
          name: "Mutton Kacchi",
          details: "Traditional kacchi biryani with tender mutton",
          price: 450,
          imageUrl:
            "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
        },
      ],
      Drink: [
        {
          name: "Fresh Lime Soda",
          details: "Refreshing lime juice with soda",
          price: 80,
          imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc",
        },
        {
          name: "Mango Lassi",
          details: "Creamy yogurt drink with fresh mango",
          price: 120,
          imageUrl:
            "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4",
        },
        {
          name: "Coca Cola",
          details: "Classic cola drink",
          price: 50,
          imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7",
        },
        {
          name: "Fresh Orange Juice",
          details: "Freshly squeezed orange juice",
          price: 100,
          imageUrl:
            "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
        },
      ],
      Dessert: [
        {
          name: "Chocolate Brownie",
          details: "Rich chocolate brownie with ice cream",
          price: 180,
          imageUrl:
            "https://images.unsplash.com/photo-1607920591413-4ec007e70023",
        },
        {
          name: "Cheesecake",
          details: "Creamy New York style cheesecake",
          price: 220,
          imageUrl:
            "https://images.unsplash.com/photo-1533134242820-b4f7a5e5b5b5",
        },
        {
          name: "Ice Cream Sundae",
          details: "Three scoops with toppings",
          price: 150,
          imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
        },
      ],
      Vegetarian: [
        {
          name: "Veggie Burger",
          details: "Plant-based patty with avocado and fresh greens",
          price: 300,
          imageUrl:
            "https://images.unsplash.com/photo-1520072959219-c595dc870360",
        },
        {
          name: "Vegetarian Supreme Pizza",
          details: "Bell peppers, mushrooms, olives, and onions",
          price: 600,
          imageUrl:
            "https://images.unsplash.com/photo-1511689660979-10d2b1aada49",
        },
      ],
    };

    const menuItems = [];
    for (const [category, items] of Object.entries(menuCategories)) {
      for (const item of items) {
        const menuItem = await MenuItem.create({
          ...item,
          category,
          isAvailable: true,
          isVegetarian: category === "Vegetarian" || category === "Dessert",
        });
        menuItems.push(menuItem);
      }
    }
    console.log(`✅ Created ${menuItems.length} menu items\n`);

    // 4. Create Recipes
    console.log("📖 Creating recipes...");
    const recipes = [
      {
        name: "Homemade Beef Burger",
        category: "Beef",
        description: "Learn to make the perfect beef burger at home",
        ingredients: [
          "500g ground beef",
          "4 burger buns",
          "Lettuce leaves",
          "2 tomatoes",
          "1 onion",
          "Cheese slices",
          "Pickles",
          "Burger sauce",
        ],
        instructions: [
          "Season the ground beef with salt and pepper",
          "Form into 4 equal patties",
          "Grill for 4-5 minutes each side",
          "Toast the buns",
          "Assemble with vegetables and sauce",
        ],
        prepTime: 15,
        cookingTime: 20,
        servings: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
      },
      {
        name: "Chicken Biryani",
        category: "Rice",
        description: "Authentic Hyderabadi style chicken biryani",
        ingredients: [
          "1kg chicken",
          "500g basmati rice",
          "2 onions",
          "Yogurt",
          "Biryani masala",
          "Saffron",
          "Ghee",
          "Fresh herbs",
        ],
        instructions: [
          "Marinate chicken with yogurt and spices",
          "Fry onions until golden",
          "Layer rice and chicken",
          "Cook on dum for 30 minutes",
          "Serve hot with raita",
        ],
        prepTime: 30,
        cookingTime: 60,
        servings: 6,
        imageUrl:
          "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8",
      },
      {
        name: "Margherita Pizza",
        category: "Pizza",
        description: "Classic Italian pizza with fresh ingredients",
        ingredients: [
          "Pizza dough",
          "Tomato sauce",
          "Fresh mozzarella",
          "Fresh basil",
          "Olive oil",
          "Salt",
        ],
        instructions: [
          "Roll out pizza dough",
          "Spread tomato sauce",
          "Add mozzarella cheese",
          "Bake at 250°C for 12 minutes",
          "Top with fresh basil",
        ],
        prepTime: 20,
        cookingTime: 12,
        servings: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
      },
      {
        name: "Chocolate Brownies",
        category: "Dessert",
        description: "Fudgy chocolate brownies that melt in your mouth",
        ingredients: [
          "200g dark chocolate",
          "150g butter",
          "3 eggs",
          "200g sugar",
          "100g flour",
          "Cocoa powder",
          "Vanilla extract",
        ],
        instructions: [
          "Melt chocolate and butter",
          "Mix eggs and sugar",
          "Combine all ingredients",
          "Bake at 180°C for 25 minutes",
          "Cool and cut into squares",
        ],
        prepTime: 15,
        cookingTime: 25,
        servings: 12,
        imageUrl:
          "https://images.unsplash.com/photo-1607920591413-4ec007e70023",
      },
      {
        name: "Pasta Carbonara",
        category: "Pasta",
        description: "Creamy Italian pasta with bacon",
        ingredients: [
          "400g spaghetti",
          "200g bacon",
          "3 eggs",
          "100g parmesan",
          "Black pepper",
          "Salt",
        ],
        instructions: [
          "Cook pasta al dente",
          "Fry bacon until crispy",
          "Mix eggs and parmesan",
          "Combine hot pasta with egg mixture",
          "Add bacon and serve",
        ],
        prepTime: 10,
        cookingTime: 15,
        servings: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1612874742237-6526221588e3",
      },
    ];

    const createdRecipes = [];
    for (const recipe of recipes) {
      const createdRecipe = await Recipe.create(recipe);
      createdRecipes.push(createdRecipe);
    }
    console.log(`✅ Created ${createdRecipes.length} recipes\n`);

    // 5. Create Orders
    console.log("📦 Creating orders...");
    const orderStatuses = ["Placed", "Processing", "Ready", "Delivered"];
    const orders = [];

    for (let i = 0; i < 30; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 4) + 1;
      const orderItems = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const item = menuItems[Math.floor(Math.random() * menuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        orderItems.push({
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          qty: quantity,
        });
        subtotal += item.price * quantity;
      }

      const deliveryFee = 50;
      const total = subtotal + deliveryFee;

      const order = await Order.create({
        userId: user._id,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        deliveryAddress: user.address,
        phone: user.phone,
        paymentMethod: ["card", "cash"][Math.floor(Math.random() * 2)],
        statusHistory: [
          {
            status: "Placed",
            at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          },
        ],
      });
      orders.push(order);
    }
    console.log(`✅ Created ${orders.length} orders\n`);

    // 6. Create Reviews
    console.log("⭐ Creating reviews...");
    const reviews = [];
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const order = orders[Math.floor(Math.random() * orders.length)];

      const review = await Review.create({
        userId: user._id,
        menuItemId: menuItem._id,
        orderId: order._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: [
          "Absolutely delicious! Will order again.",
          "Great taste and quality. Highly recommended!",
          "Perfect! Exceeded my expectations.",
          "Very good food. Fast delivery too.",
          "Amazing flavor. Best I've had!",
        ][Math.floor(Math.random() * 5)],
      });
      reviews.push(review);
    }
    console.log(`✅ Created ${reviews.length} reviews\n`);

    // 7. Create Offers
    console.log("🎁 Creating offers...");
    const offers = await Offer.create([
      {
        title: "Welcome Offer",
        code: "WELCOME20",
        description: "20% off on your first order",
        discountType: "percentage",
        discountValue: 20,
        minimumOrderAmount: 200,
        maxDiscountAmount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageLimit: 1000,
        usageCount: 45,
        createdBy: admin._id,
      },
      {
        title: "Save 100 BDT",
        code: "SAVE100",
        description: "Flat 100 BDT off on orders above 500",
        discountType: "fixed",
        discountValue: 100,
        minimumOrderAmount: 500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageLimit: 500,
        usageCount: 123,
        createdBy: admin._id,
      },
      {
        title: "Weekend Special",
        code: "WEEKEND30",
        description: "30% off on weekend orders",
        discountType: "percentage",
        discountValue: 30,
        minimumOrderAmount: 300,
        maxDiscountAmount: 300,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageLimit: 200,
        usageCount: 67,
        createdBy: admin._id,
      },
    ]);
    console.log(`✅ Created ${offers.length} offers\n`);

    // 8. Create Flash Deals
    console.log("⚡ Creating flash deals...");
    const flashDeals = [];
    for (let i = 0; i < 5; i++) {
      const item = menuItems[Math.floor(Math.random() * menuItems.length)];
      const discountValue = [20, 30, 40, 50][Math.floor(Math.random() * 4)];
      const dealPrice = item.price * (1 - discountValue / 100);

      const deal = await FlashDeal.create({
        title: `${discountValue}% OFF - ${item.name}`,
        description: `Limited time offer on ${item.name}`,
        menuItemId: item._id,
        discountType: "percentage",
        discountValue,
        originalPrice: item.price,
        dealPrice: Math.round(dealPrice),
        startTime: new Date(),
        endTime: new Date(Date.now() + (6 + i) * 60 * 60 * 1000), // 6-10 hours
        maxQuantity: 50,
        soldQuantity: Math.floor(Math.random() * 20),
        isActive: true,
        clickCount: Math.floor(Math.random() * 100) + 50,
        conversionCount: Math.floor(Math.random() * 30) + 10,
      });
      flashDeals.push(deal);
    }
    console.log(`✅ Created ${flashDeals.length} flash deals\n`);

    // 9. Create Promo Banners
    console.log("🎨 Creating promo banners...");
    const banners = await PromoBanner.create([
      {
        title: "Weekend Special",
        description: "Get 30% off on all orders this weekend!",
        imageUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        linkUrl: "/offers",
        linkType: "offer",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        priority: 10,
        targetAudience: "all",
        impressionCount: 1234,
        clickCount: 156,
      },
      {
        title: "New Menu Items",
        description: "Check out our latest additions!",
        imageUrl:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
        linkUrl: "/menu",
        linkType: "menu",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        priority: 8,
        targetAudience: "all",
        impressionCount: 2345,
        clickCount: 234,
      },
      {
        title: "Free Delivery",
        description: "Free delivery on orders above 500 BDT",
        imageUrl:
          "https://images.unsplash.com/photo-1526367790999-0150786686a2",
        linkUrl: "/order",
        linkType: "menu",
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true,
        priority: 9,
        targetAudience: "all",
        impressionCount: 3456,
        clickCount: 345,
      },
    ]);
    console.log(`✅ Created ${banners.length} promo banners\n`);

    // 10. Create Notifications
    console.log("🔔 Creating notifications...");
    const notifications = [];
    for (const user of users.slice(0, 5)) {
      const userNotifications = await Notification.create([
        {
          userId: user._id,
          type: "order",
          title: "Order Delivered!",
          message: "Your order has been delivered successfully.",
          priority: "high",
          read: Math.random() > 0.5,
        },
        {
          userId: user._id,
          type: "promo",
          title: "Special Offer!",
          message: "Get 30% off on your next order. Use code SAVE30",
          priority: "normal",
          read: Math.random() > 0.5,
        },
        {
          userId: user._id,
          type: "system",
          title: "Welcome to FoodBuzz!",
          message:
            "Thank you for joining us. Enjoy your first order with 20% off!",
          priority: "normal",
          read: true,
        },
      ]);
      notifications.push(...userNotifications);
    }
    console.log(`✅ Created ${notifications.length} notifications\n`);

    // 11. Create Points Transactions
    console.log("💰 Creating points transactions...");
    const transactions = [];
    for (const user of users.slice(0, 5)) {
      const userTransactions = await PointsTransaction.create([
        {
          userId: user._id,
          type: "earned",
          points: 500,
          description: "First order bonus",
        },
        {
          userId: user._id,
          type: "earned",
          points: 50,
          description: "Earned from order",
          orderId: orders[0]._id,
        },
        {
          userId: user._id,
          type: "review",
          points: 50,
          description: "Earned 50 points for writing a review",
        },
      ]);
      transactions.push(...userTransactions);
    }
    console.log(`✅ Created ${transactions.length} points transactions\n`);

    // Summary
    console.log("\n🎉 Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(
      `   👥 Users: ${users.length + 2} (${users.length} customers, 1 admin, 1 staff)`,
    );
    console.log(`   📍 Addresses: ${addresses.length}`);
    console.log(`   🍔 Menu Items: ${menuItems.length}`);
    console.log(`   📖 Recipes: ${createdRecipes.length}`);
    console.log(`   📦 Orders: ${orders.length}`);
    console.log(`   ⭐ Reviews: ${reviews.length}`);
    console.log(`   🎁 Offers: ${offers.length}`);
    console.log(`   ⚡ Flash Deals: ${flashDeals.length}`);
    console.log(`   🎨 Promo Banners: ${banners.length}`);
    console.log(`   🔔 Notifications: ${notifications.length}`);
    console.log(`   💰 Points Transactions: ${transactions.length}`);
    console.log("\n✅ You can now login with:");
    console.log("   Admin: admin@foodbuzz.com / password123");
    console.log("   Staff: staff@foodbuzz.com / password123");
    console.log("   User: user1@example.com / password123");
    console.log(
      "\n🚀 Start your server and enjoy the fully populated database!\n",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
