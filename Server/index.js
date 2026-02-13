/**
 * FoodBuzz API - Main Entry Point
 *
 * This file serves as the main entry point for both:
 * - Local development (node index.js)
 * - Vercel serverless deployment
 */

require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const MenuItem = require("./src/models/MenuItem");
const { initializePushService } = require("./src/utils/pushService");

// Initialize Express app
const app = express();

// ============================================================================
// CORS Configuration
// ============================================================================
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  const origin = req.headers.origin;

  // In production, check if origin is allowed
  if (
    process.env.NODE_ENV === "production" &&
    allowedOrigins.includes(origin)
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV !== "production") {
    // In development, allow all origins
    res.header("Access-Control-Allow-Origin", "*");
  } else {
    // Fallback: allow all (for initial deployment)
    res.header("Access-Control-Allow-Origin", "*");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ============================================================================
// Middleware
// ============================================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging (development only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// Database Connection
// ============================================================================
connectDB();

// ============================================================================
// Health Check Routes
// ============================================================================
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "FoodBuzz API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================================================
// Menu Items Routes (Inline for critical endpoints)
// ============================================================================

// GET all menu items
app.get("/api/menu-items", async (req, res) => {
  try {
    const items = await MenuItem.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("[MENU ITEMS] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET menu item by ID
app.get("/api/menu-items/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json(item);
  } catch (err) {
    console.error("[MENU ITEM BY ID] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST - Create menu item
app.post("/api/menu-items", async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    console.error("[MENU ITEMS] Create error:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT - Update menu item
app.put("/api/menu-items/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json(item);
  } catch (err) {
    console.error("[MENU ITEMS] Update error:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE - Delete menu item
app.delete("/api/menu-items/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted successfully" });
  } catch (err) {
    console.error("[MENU ITEMS] Delete error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// API Routes
// ============================================================================
app.use("/api/auth", require("./src/routes/auth.routes.simple"));
app.use("/api/recipes", require("./src/routes/recipe.routes"));
app.use("/api/orders", require("./src/routes/order.routes"));
app.use("/api/offers", require("./src/routes/offer.routes"));
app.use("/api/admin", require("./src/routes/admin.routes"));
app.use("/api/admin", require("./src/routes/admin.user.routes"));
app.use("/api/admin", require("./src/routes/admin.staff.routes"));
app.use("/api/admin", require("./src/routes/admin.promo.routes"));
app.use("/api/users", require("./src/routes/user.routes"));
app.use("/api/favorites", require("./src/routes/favorites.routes"));
app.use("/api/reviews", require("./src/routes/review.routes"));
app.use("/api/upload", require("./src/routes/upload.routes"));
app.use("/api/payments", require("./src/routes/payment.routes"));
app.use("/api/notifications", require("./src/routes/notification.routes"));
app.use("/api/inventory", require("./src/routes/inventory.routes"));
app.use("/api/orders/pos", require("./src/routes/pos.routes"));
app.use("/api/orders", require("./src/routes/order.lifecycle.routes"));
app.use("/api/loyalty", require("./src/routes/loyalty.routes"));
app.use("/api/referral", require("./src/routes/referral.routes"));
app.use("/api/flash-deals", require("./src/routes/flashdeal.routes"));
app.use("/api/banners", require("./src/routes/banner.routes"));
app.use("/api/recommendations", require("./src/routes/recommendation.routes"));
app.use("/api/subscriptions", require("./src/routes/subscription.routes"));
app.use("/api/health", require("./src/routes/health.routes"));

// ============================================================================
// 404 Handler
// ============================================================================
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.path,
  });
});

// ============================================================================
// Error Handler
// ============================================================================
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  console.error(err.stack);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ============================================================================
// Server Startup (Local Development)
// ============================================================================
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || "0.0.0.0";

  app.listen(PORT, HOST, () => {
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║                                                        ║");
    console.log("║              🍽️  FoodBuzz API Server 🍽️               ║");
    console.log("║                                                        ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log("");
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `📊 Database: ${process.env.MONGO_URI ? "Connected" : "Not configured"}`,
    );
    console.log("");
    console.log("Available endpoints:");
    console.log("  GET  /              - API info");
    console.log("  GET  /health        - Health check");
    console.log("  GET  /api/menu-items - Get all menu items");
    console.log("");
    console.log("Press Ctrl+C to stop the server");
    console.log("════════════════════════════════════════════════════════");

    // Initialize push notification service
    try {
      initializePushService();
      console.log("✅ Push notification service initialized");
    } catch (error) {
      console.log("⚠️  Push notification service not available");
    }
  });
}

// ============================================================================
// Export for Vercel Serverless
// ============================================================================
module.exports = app;
