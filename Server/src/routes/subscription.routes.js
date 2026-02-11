const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const subscriptionController = require("../controllers/subscription.controller");

// Public routes
router.get("/plans", subscriptionController.getAvailablePlans);

// Authenticated routes
router.use(auth);

router.get("/my", subscriptionController.getMySubscriptions);
router.get("/:id", subscriptionController.getSubscription);
router.post("/", subscriptionController.createSubscription);
router.put("/:id", subscriptionController.updateSubscription);
router.patch("/:id/pause", subscriptionController.pauseSubscription);
router.patch("/:id/resume", subscriptionController.resumeSubscription);
router.patch("/:id/cancel", subscriptionController.cancelSubscription);

// Admin routes
router.get(
  "/admin/all",
  allowRoles("admin"),
  subscriptionController.getAllSubscriptions,
);

module.exports = router;
