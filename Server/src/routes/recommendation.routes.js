const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const recommendationController = require("../controllers/recommendation.controller");

// Public routes
router.get("/popular", recommendationController.getPopularItems);
router.get("/trending", recommendationController.getTrendingItems);
router.get("/new", recommendationController.getNewItems);
router.get("/similar", recommendationController.getSimilarItems);
router.get(
  "/frequently-bought-together",
  recommendationController.getFrequentlyBoughtTogether,
);

// Authenticated routes (personalized)
router.get(
  "/for-you",
  auth,
  recommendationController.getPersonalizedRecommendations,
);

module.exports = router;
