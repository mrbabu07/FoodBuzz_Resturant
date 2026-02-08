// Upload routes for image uploads
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const uploadController = require("../controllers/upload.controller");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/roles");

// POST /api/upload/image - Upload single image (staff/admin only)
router.post(
  "/image",
  auth,
  requireRole("admin", "staff"),
  upload.single("image"),
  uploadController.uploadImage,
);

// POST /api/upload/images - Upload multiple images (staff/admin only)
router.post(
  "/images",
  auth,
  requireRole("admin", "staff"),
  upload.array("images", 10),
  uploadController.uploadMultipleImages,
);

module.exports = router;
