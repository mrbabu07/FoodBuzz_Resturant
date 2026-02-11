// Server/src/routes/order.lifecycle.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  cancelOrder,
  requestReturn,
  getOrderTimeline,
} = require("../controllers/order.lifecycle.controller");

// Cancel order
router.post("/:id/cancel", auth, cancelOrder);

// Request return/refund
router.post("/:id/return", auth, requestReturn);

// Get order timeline
router.get("/:id/timeline", auth, getOrderTimeline);

module.exports = router;
