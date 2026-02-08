//path: roms-backend/src/routes/review.routes.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");

const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getMyReviews,
} = require("../controllers/review.controller");

// Public routes
router.get("/", getReviews); // Get reviews with filters

// Protected routes
router.post("/", auth, allowRoles("user", "admin"), createReview);
router.get("/my", auth, allowRoles("user", "admin"), getMyReviews);
router.get("/:id", getReviewById);
router.put("/:id", auth, allowRoles("user", "admin"), updateReview);
router.delete("/:id", auth, allowRoles("user", "admin"), deleteReview);

module.exports = router;
