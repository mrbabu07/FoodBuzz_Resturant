const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const bannerController = require("../controllers/banner.controller");

// Public routes
router.get("/", bannerController.getActiveBanners);
router.post("/:id/impression", bannerController.trackImpression);
router.post("/:id/click", bannerController.trackClick);

// Admin routes
router.post(
  "/admin/create",
  auth,
  allowRoles("admin"),
  bannerController.createBanner,
);
router.get(
  "/admin/all",
  auth,
  allowRoles("admin"),
  bannerController.getAllBanners,
);
router.get(
  "/admin/:id/analytics",
  auth,
  allowRoles("admin"),
  bannerController.getBannerAnalytics,
);
router.put(
  "/admin/:id",
  auth,
  allowRoles("admin"),
  bannerController.updateBanner,
);
router.delete(
  "/admin/:id",
  auth,
  allowRoles("admin"),
  bannerController.deleteBanner,
);

module.exports = router;
