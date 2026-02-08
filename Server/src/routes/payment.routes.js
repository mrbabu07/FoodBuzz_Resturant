// Payment Routes
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/roles");

// Customer routes
router.post("/create-checkout", auth, paymentController.createDirectCheckout);
router.post(
  "/create-checkout-session",
  auth,
  paymentController.createCheckoutSession,
);
router.get("/verify", auth, paymentController.verifyPayment);
router.get("/history", auth, paymentController.getPaymentHistory);
router.get("/:paymentId", auth, paymentController.getPaymentDetails);

// Admin routes
router.post(
  "/:paymentId/refund",
  auth,
  requireRole("admin"),
  paymentController.refundPayment,
);
router.get(
  "/stats/overview",
  auth,
  requireRole("admin"),
  paymentController.getPaymentStats,
);

// Webhook (no auth - Stripe will verify)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook,
);

module.exports = router;
