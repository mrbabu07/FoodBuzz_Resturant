const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const loyaltyController = require("../controllers/loyalty.controller");

// All routes require authentication
router.use(auth);

// User routes
router.get("/balance", loyaltyController.getBalance);
router.get("/transactions", loyaltyController.getTransactions);
router.post("/redeem", loyaltyController.redeemPoints);
router.get("/rules", loyaltyController.getRules);

// Admin routes
router.post("/award", allowRoles("admin"), loyaltyController.awardPoints);

module.exports = router;
