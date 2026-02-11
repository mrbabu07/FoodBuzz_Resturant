// Server/src/controllers/address.controller.js
const Address = require("../models/Address");

/**
 * Get All Addresses
 * GET /api/addresses
 */
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({
      message: "Failed to fetch addresses",
      error: error.message,
    });
  }
};

/**
 * Get Default Address
 * GET /api/addresses/default
 */
exports.getDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      userId: req.user._id,
      isDefault: true,
    });

    if (!address) {
      return res.status(404).json({ message: "No default address found" });
    }

    res.json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Get default address error:", error);
    res.status(500).json({
      message: "Failed to fetch default address",
      error: error.message,
    });
  }
};

/**
 * Create Address
 * POST /api/addresses
 */
exports.createAddress = async (req, res) => {
  try {
    const {
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      area,
      city,
      postalCode,
      landmark,
      coordinates,
      isDefault,
      deliveryInstructions,
    } = req.body;

    // Validate required fields
    if (!fullName || !phone || !addressLine1 || !area || !city) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Check if this is the first address (make it default)
    const existingCount = await Address.countDocuments({
      userId: req.user._id,
    });
    const shouldBeDefault = existingCount === 0 || isDefault;

    const address = await Address.create({
      userId: req.user._id,
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      area,
      city,
      postalCode,
      landmark,
      coordinates,
      isDefault: shouldBeDefault,
      deliveryInstructions,
    });

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      address,
    });
  } catch (error) {
    console.error("Create address error:", error);
    res.status(500).json({
      message: "Failed to create address",
      error: error.message,
    });
  }
};

/**
 * Update Address
 * PUT /api/addresses/:id
 */
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const {
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      area,
      city,
      postalCode,
      landmark,
      coordinates,
      isDefault,
      deliveryInstructions,
    } = req.body;

    // Update fields
    if (label) address.label = label;
    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (area) address.area = area;
    if (city) address.city = city;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (landmark !== undefined) address.landmark = landmark;
    if (coordinates) address.coordinates = coordinates;
    if (isDefault !== undefined) address.isDefault = isDefault;
    if (deliveryInstructions !== undefined)
      address.deliveryInstructions = deliveryInstructions;

    await address.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({
      message: "Failed to update address",
      error: error.message,
    });
  }
};

/**
 * Set Default Address
 * PATCH /api/addresses/:id/default
 */
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Remove default from all other addresses
    await Address.updateMany(
      { userId: req.user._id, _id: { $ne: id } },
      { isDefault: false },
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: "Default address updated",
      address,
    });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({
      message: "Failed to set default address",
      error: error.message,
    });
  }
};

/**
 * Delete Address
 * DELETE /api/addresses/:id
 */
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If deleted address was default, set another as default
    if (wasDefault) {
      const nextAddress = await Address.findOne({ userId: req.user._id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({
      message: "Failed to delete address",
      error: error.message,
    });
  }
};
