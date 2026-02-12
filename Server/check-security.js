#!/usr/bin/env node

/**
 * Security Check Script
 * Verifies that sensitive files are not tracked by Git
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔒 FoodBuzz Security Check\n");

// Files that should NEVER be committed
const sensitiveFiles = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".env.test",
  "credentials.json",
  "serviceAccount.json",
  "config.json",
];

// Check if files exist and are gitignored
let hasIssues = false;

console.log("Checking for sensitive files...\n");

sensitiveFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);

  if (fs.existsSync(filePath)) {
    console.log(`⚠️  Found: ${file}`);

    try {
      // Check if file is tracked by git
      const result = execSync(`git ls-files ${file}`, { encoding: "utf-8" });

      if (result.trim()) {
        console.log(`   ❌ ERROR: ${file} is tracked by Git!`);
        console.log(`   Run: git rm --cached ${file}`);
        hasIssues = true;
      } else {
        console.log(`   ✅ Properly gitignored`);
      }
    } catch (error) {
      console.log(`   ✅ Not tracked by Git`);
    }
  }
});

console.log("\n" + "=".repeat(50) + "\n");

// Check .gitignore exists
const gitignorePath = path.join(__dirname, ".gitignore");
if (!fs.existsSync(gitignorePath)) {
  console.log("❌ ERROR: .gitignore file not found!");
  hasIssues = true;
} else {
  console.log("✅ .gitignore file exists");

  // Check if .env is in .gitignore
  const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
  if (!gitignoreContent.includes(".env")) {
    console.log("⚠️  WARNING: .env not found in .gitignore");
    hasIssues = true;
  } else {
    console.log("✅ .env is gitignored");
  }
}

// Check if .env.production.example exists
const examplePath = path.join(__dirname, ".env.production.example");
if (!fs.existsSync(examplePath)) {
  console.log("⚠️  WARNING: .env.production.example not found");
  console.log("   This file should exist as a template");
} else {
  console.log("✅ .env.production.example exists");
}

// Check environment variables
console.log("\n" + "=".repeat(50) + "\n");
console.log("Checking environment variables...\n");

require("dotenv").config();

const requiredVars = ["MONGO_URI", "JWT_SECRET", "FRONTEND_URL"];

const recommendedVars = [
  "SMTP_USER",
  "SMTP_PASS",
  "IMGBB_API_KEY",
  "STRIPE_SECRET_KEY",
];

requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.log(`❌ MISSING: ${varName} (Required)`);
    hasIssues = true;
  } else {
    // Check if it's a placeholder value
    const value = process.env[varName];
    if (
      value.includes("your_") ||
      value.includes("YOUR_") ||
      value.includes("replace")
    ) {
      console.log(`⚠️  ${varName}: Appears to be a placeholder value`);
      hasIssues = true;
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  }
});

console.log("");

recommendedVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.log(`⚠️  ${varName}: Not set (Recommended)`);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

// Check JWT_SECRET strength
if (process.env.JWT_SECRET) {
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret.length < 32) {
    console.log("\n⚠️  WARNING: JWT_SECRET should be at least 32 characters");
    hasIssues = true;
  }
  if (jwtSecret === "foodbuzz_super_secret_key_2024") {
    console.log("\n❌ ERROR: Using default JWT_SECRET! Generate a new one!");
    console.log(
      "   Run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
    hasIssues = true;
  }
}

// Final summary
console.log("\n" + "=".repeat(50) + "\n");

if (hasIssues) {
  console.log("❌ Security issues found! Please fix them before deploying.\n");
  process.exit(1);
} else {
  console.log("✅ All security checks passed!\n");
  console.log("Remember to:");
  console.log("  - Never commit .env files");
  console.log("  - Use strong, unique passwords");
  console.log("  - Rotate secrets regularly");
  console.log("  - Enable 2FA on all services");
  console.log("  - Monitor for suspicious activity\n");
  process.exit(0);
}
