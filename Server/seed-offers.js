require("dotenv").config();
const mongoose = require("mongoose");
const Offer = require("./src/models/Offer");
const User = require("./src/models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for seeding offers");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const sampleOffers = [
  {
    title: "Welcome Bonus",
    description:
      "Get 20% off on your first order! Perfect for new customers to try our delicious food.",
    discountType: "percentage",
    discountValue: 20,
    minimumOrderAmount: 15,
    maxDiscountAmount: 10,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
    showAsModal: true,
    backgroundColor: "#f97316",
    textColor: "#ffffff",
    buttonText: "Claim 20% Off",
    usageLimit: 1000,
    applicableCategories: [],
  },
  {
    title: "Free Delivery Weekend",
    description:
      "Enjoy free delivery on all orders this weekend! No minimum order required.",
    discountType: "free_delivery",
    minimumOrderAmount: 0,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    isActive: true,
    showAsModal: true,
    backgroundColor: "#10b981",
    textColor: "#ffffff",
    buttonText: "Get Free Delivery",
    usageLimit: 500,
    applicableCategories: [],
  },
  {
    title: "Pizza Party Deal",
    description:
      "Buy any large pizza and get a second one absolutely free! Perfect for sharing.",
    discountType: "bogo",
    minimumOrderAmount: 20,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    isActive: true,
    showAsModal: true,
    backgroundColor: "#dc2626",
    textColor: "#ffffff",
    buttonText: "Get BOGO Pizza",
    usageLimit: 200,
    applicableCategories: ["Pizza"],
  },
  {
    title: "Student Discount",
    description:
      "Students get $5 off on orders above $25. Show your student ID!",
    discountType: "fixed",
    discountValue: 5,
    minimumOrderAmount: 25,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    isActive: true,
    showAsModal: false, // Don't show in modal, but available for use
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    buttonText: "Apply Student Discount",
    usageLimit: 300,
    applicableCategories: [],
  },
  {
    title: "Lunch Special",
    description:
      "Get 15% off on all lunch orders between 11 AM - 3 PM on weekdays.",
    discountType: "percentage",
    discountValue: 15,
    minimumOrderAmount: 12,
    maxDiscountAmount: 8,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    isActive: true,
    showAsModal: true,
    backgroundColor: "#f59e0b",
    textColor: "#ffffff",
    buttonText: "Claim Lunch Deal",
    usageLimit: 400,
    applicableCategories: ["Sandwich", "Salad", "Soup"],
  },
  {
    title: "Family Feast",
    description:
      "Order for $50 or more and save $12! Perfect for family dinners.",
    discountType: "fixed",
    discountValue: 12,
    minimumOrderAmount: 50,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
    isActive: true,
    showAsModal: true,
    backgroundColor: "#8b5cf6",
    textColor: "#ffffff",
    buttonText: "Save on Family Order",
    usageLimit: 150,
    applicableCategories: [],
  },
];

const seedOffers = async () => {
  try {
    await connectDB();

    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.email})`);

    // Clear existing offers
    await Offer.deleteMany({});
    console.log("🗑️ Cleared existing offers");

    // Add createdBy field to all offers
    const offersWithCreator = sampleOffers.map((offer) => ({
      ...offer,
      createdBy: adminUser._id,
    }));

    // Insert sample offers
    const createdOffers = await Offer.insertMany(offersWithCreator);
    console.log(`✅ Created ${createdOffers.length} sample offers:`);

    createdOffers.forEach((offer, index) => {
      console.log(`   ${index + 1}. ${offer.title} (${offer.discountType})`);
    });

    console.log("\n🎉 Offer seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   • Total offers: ${createdOffers.length}`);
    console.log(
      `   • Modal offers: ${createdOffers.filter((o) => o.showAsModal).length}`,
    );
    console.log(
      `   • Active offers: ${createdOffers.filter((o) => o.isActive).length}`,
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding offers:", error);
    process.exit(1);
  }
};

// Run the seeding
seedOffers();
