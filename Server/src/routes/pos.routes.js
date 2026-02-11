// Server/src/routes/pos.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const {
  createPOSOrder,
  getPOSOrders,
  updatePOSOrderStatus,
} = require("../controllers/pos.controller");

// All POS routes require authentication and admin/staff role
router.use(auth, allowRoles("admin", "staff"));

// Create POS order
router.post("/", createPOSOrder);

// Get POS orders
router.get("/", getPOSOrders);

// Update POS order status
router.patch("/:id/status", updatePOSOrderStatus);

module.exports = router;
