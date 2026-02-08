const express = require("express");
const router = express.Router();
const {
  getAllOffers,
  getActiveOffers,
  getModalOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  getOfferById,
  applyOfferToOrder,
} = require("../controllers/offer.controller");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

// Public routes
router.get("/active", getActiveOffers);
router.get("/modal", getModalOffers);
router.post("/apply", applyOfferToOrder);

// Protected routes (require authentication)
router.use(auth);

// Admin only routes
router.get("/", roles("admin"), getAllOffers);
router.post("/", roles("admin"), createOffer);
router.get("/:id", roles("admin"), getOfferById);
router.put("/:id", roles("admin"), updateOffer);
router.delete("/:id", roles("admin"), deleteOffer);
router.patch("/:id/toggle", roles("admin"), toggleOfferStatus);

module.exports = router;
