// Server/src/routes/delivery.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  assignRider,
  getAvailableRiders,
  updateRiderLocation,
  completeDelivery,
  getRiderDashboard,
} = require("../controllers/delivery.controller");

// Admin/Staff routes
router.post("/assign", protect, authorize("admin", "staff"), assignRider);
router.get(
  "/riders/available",
  protect,
  authorize("admin", "staff"),
  getAvailableRiders,
);

// Rider routes
router.put("/location", protect, authorize("rider"), updateRiderLocation);
router.post(
  "/:orderId/complete",
  protect,
  authorize("rider"),
  completeDelivery,
);
router.get("/dashboard", protect, authorize("rider"), getRiderDashboard);

module.exports = router;
