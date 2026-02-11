const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/roles");
const flashDealController = require("../controllers/flashdeal.controller");

// Public routes
router.get("/", flashDealController.getActiveDeals);
router.get("/:id", flashDealController.getDeal);

// Authenticated routes
router.use(auth);

router.post("/:id/click", flashDealController.trackClick);
router.post("/:id/convert", flashDealController.trackConversion);

// Admin routes
router.post(
  "/admin/create",
  allowRoles("admin"),
  flashDealController.createDeal,
);
router.get("/admin/all", allowRoles("admin"), flashDealController.getAllDeals);
router.put("/admin/:id", allowRoles("admin"), flashDealController.updateDeal);
router.delete(
  "/admin/:id",
  allowRoles("admin"),
  flashDealController.deleteDeal,
);

module.exports = router;
