#!/usr/bin/env node

/**
 * Push Notification Setup Script
 *
 * This script helps you set up push notifications by:
 * 1. Checking if web-push is installed
 * 2. Generating VAPID keys
 * 3. Showing you what to add to .env
 *
 * Usage: node setup-push-notifications.js
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔔 FoodBuzz Push Notification Setup\n");
console.log("═".repeat(50));

// Check if web-push is installed
let webpush;
try {
  webpush = require("web-push");
  console.log("✅ web-push is installed");
} catch (error) {
  console.log("❌ web-push is NOT installed");
  console.log("\n📦 Installing web-push...\n");
  console.log("Run this command:");
  console.log("   npm install web-push");
  console.log("\nThen run this script again.");
  process.exit(1);
}

// Generate VAPID keys
console.log("\n🔑 Generating VAPID keys...\n");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("✅ VAPID keys generated successfully!\n");
console.log("═".repeat(50));
console.log("\n📋 Add these to your .env file:\n");
console.log("VAPID_PUBLIC_KEY=" + vapidKeys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + vapidKeys.privateKey);
console.log("VAPID_SUBJECT=mailto:your@email.com");
console.log("\n═".repeat(50));

// Check if .env exists
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  console.log("\n📄 Your .env file location:");
  console.log("   " + envPath);

  // Check if VAPID keys already exist
  const envContent = fs.readFileSync(envPath, "utf8");
  if (envContent.includes("VAPID_PUBLIC_KEY")) {
    console.log("\n⚠️  WARNING: VAPID keys already exist in .env");
    console.log("   Only replace them if you want to regenerate.");
  } else {
    console.log(
      "\n💡 TIP: Copy the keys above and paste them at the end of your .env file",
    );
  }
} else {
  console.log("\n⚠️  .env file not found at:");
  console.log("   " + envPath);
  console.log("\n   Create a .env file and add the keys above.");
}

console.log("\n═".repeat(50));
console.log("\n✨ Next Steps:\n");
console.log("1. Copy the VAPID keys above");
console.log("2. Add them to your .env file");
console.log("3. Update VAPID_SUBJECT with your email");
console.log("4. Restart your server");
console.log("5. Test push notifications!\n");
console.log("═".repeat(50));
console.log("\n🎉 Setup complete! Happy coding!\n");
