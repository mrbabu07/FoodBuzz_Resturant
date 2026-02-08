// Working server with inline menu items handler
require("dotenv").config();
console.log("Mongo URI:", process.env.MONGO_URI);
const express = require("express");
const connectDB = require("./src/config/db");
const MenuItem = require("./src/models/MenuItem");

const app = express();

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Body parsing
app.use(express.json());

// Connect DB
connectDB();

// Health check
app.get("/", (req, res) => {
  res.json({ status: "success", message: "FoodBuzz API" });
});

// Menu items - INLINE handler (no external route file)
app.get("/api/menu-items/:id", async (req, res) => {
  try {
    console.log(`[MENU ITEM BY ID] ${req.params.id}`);
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      console.log(`[MENU ITEM BY ID] Not found: ${req.params.id}`);
      return res.status(404).json({ message: "Not found" });
    }
    console.log(`[MENU ITEM BY ID] Found: ${item.name}`);
    res.json(item);
  } catch (err) {
    console.error(`[MENU ITEM BY ID] Error:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/menu-items", async (req, res) => {
  try {
    console.log("[MENU ITEMS] Getting all items");
    const items = await MenuItem.find({}).sort({ createdAt: -1 });
    console.log(`[MENU ITEMS] Found ${items.length} items`);
    res.json(items);
  } catch (err) {
    console.error("[MENU ITEMS] Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST - Create menu item (admin/staff only)
app.post("/api/menu-items", async (req, res) => {
  try {
    console.log("[MENU ITEMS] Creating new item");
    const item = await MenuItem.create(req.body);
    console.log(`[MENU ITEMS] Created: ${item.name}`);
    res.status(201).json(item);
  } catch (err) {
    console.error("[MENU ITEMS] Create error:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT - Update menu item (admin/staff only)
app.put("/api/menu-items/:id", async (req, res) => {
  try {
    console.log(`[MENU ITEMS] Updating: ${req.params.id}`);
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) {
      console.log(`[MENU ITEMS] Not found for update: ${req.params.id}`);
      return res.status(404).json({ message: "Not found" });
    }
    console.log(`[MENU ITEMS] Updated: ${item.name}`);
    res.json(item);
  } catch (err) {
    console.error("[MENU ITEMS] Update error:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE - Delete menu item (admin only)
app.delete("/api/menu-items/:id", async (req, res) => {
  try {
    console.log(`[MENU ITEMS] Deleting: ${req.params.id}`);
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      console.log(`[MENU ITEMS] Not found for delete: ${req.params.id}`);
      return res.status(404).json({ message: "Not found" });
    }
    console.log(`[MENU ITEMS] Deleted: ${item.name}`);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("[MENU ITEMS] Delete error:", err);
    res.status(500).json({ message: err.message });
  }
});

// All other routes
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

// Error handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ message: err.message });
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 FoodBuzz API on http://localhost:${PORT}`);
});
