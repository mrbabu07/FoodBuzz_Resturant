// Server/src/routes/address.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} = require("../controllers/address.controller");

// Get all addresses
router.get("/", protect, getAddresses);

// Get default address
router.get("/default", protect, getDefaultAddress);

// Create address
router.post("/", protect, createAddress);

// Update address
router.put("/:id", protect, updateAddress);

// Set default address
router.patch("/:id/default", protect, setDefaultAddress);

// Delete address
router.delete("/:id", protect, deleteAddress);

module.exports = router;
