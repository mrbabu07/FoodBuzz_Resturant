// Review Controller
const Review = require("../models/Review");
const Order = require("../models/Order");
const mongoose = require("mongoose");

// POST /api/reviews - Create a review
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, menuItemId, menuItemName, rating, comment, recipeId } =
      req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // If reviewing a menu item from an order, verify the order belongs to user
    if (orderId && menuItemId) {
      if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (String(order.userId) !== String(userId)) {
        return res.status(403).json({ message: "Not your order" });
      }

      // Check if already reviewed this item in this order
      const existing = await Review.findOne({ userId, orderId, menuItemId });
      if (existing) {
        return res
          .status(400)
          .json({ message: "You already reviewed this item" });
      }
    }

    // Create review
    const review = await Review.create({
      userId,
      orderId: orderId || null,
      menuItemId: menuItemId || null,
      menuItemName: menuItemName || "",
      recipeId: recipeId || null,
      rating: Number(rating),
      comment: String(comment || "").trim(),
    });

    // Populate user info
    await review.populate("userId", "name email");

    return res.status(201).json({ message: "Review created", review });
  } catch (err) {
    console.error("createReview error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/reviews - Get reviews with filters
exports.getReviews = async (req, res) => {
  try {
    const { menuItemId, recipeId, orderId, userId } = req.query;

    const filter = {};
    if (menuItemId) filter.menuItemId = menuItemId;
    if (recipeId) filter.recipeId = recipeId;
    if (orderId) filter.orderId = orderId;
    if (userId) filter.userId = userId;

    const reviews = await Review.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Calculate average rating if filtering by menuItemId or recipeId
    let avgRating = null;
    if (menuItemId || recipeId) {
      const ratings = reviews.map((r) => r.rating);
      if (ratings.length > 0) {
        avgRating = (
          ratings.reduce((a, b) => a + b, 0) / ratings.length
        ).toFixed(1);
      }
    }

    return res.json({
      reviews,
      count: reviews.length,
      avgRating,
    });
  } catch (err) {
    console.error("getReviews error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/reviews/:id - Get single review
exports.getReviewById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.json(review);
  } catch (err) {
    console.error("getReviewById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/reviews/:id - Update review
exports.updateReview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only owner can update
    if (String(review.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not your review" });
    }

    const { rating, comment } = req.body;

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      review.comment = String(comment).trim();
    }

    await review.save();
    await review.populate("userId", "name email");

    return res.json({ message: "Review updated", review });
  } catch (err) {
    console.error("updateReview error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/reviews/:id - Delete review
exports.deleteReview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Owner or admin can delete
    const isOwner = String(review.userId) === String(req.user.id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Review.findByIdAndDelete(req.params.id);

    return res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/reviews/my - Get current user's reviews
exports.getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const reviews = await Review.find({ userId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (err) {
    console.error("getMyReviews error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
