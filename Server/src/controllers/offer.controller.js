const Offer = require("../models/Offer");

// Get all offers (admin)
const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find({})
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    console.error("Get all offers error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get active offers for users
const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ["$usageCount", "$usageLimit"] } },
      ],
    }).sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    console.error("Get active offers error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get modal offers (shown on login)
const getModalOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      showAsModal: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ["$usageCount", "$usageLimit"] } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(3); // Show max 3 offers in modal

    res.json(offers);
  } catch (error) {
    console.error("Get modal offers error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create new offer (admin only)
const createOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      isActive,
      showAsModal,
      imageUrl,
      backgroundColor,
      textColor,
      buttonText,
      usageLimit,
      applicableCategories,
    } = req.body;

    // Validate dates
    if (new Date(validFrom) >= new Date(validUntil)) {
      return res.status(400).json({
        message: "Valid from date must be before valid until date",
      });
    }

    const offer = new Offer({
      title,
      description,
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maxDiscountAmount,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isActive: isActive !== undefined ? isActive : true,
      showAsModal: showAsModal !== undefined ? showAsModal : true,
      imageUrl,
      backgroundColor: backgroundColor || "#f97316",
      textColor: textColor || "#ffffff",
      buttonText: buttonText || "Claim Offer",
      usageLimit,
      applicableCategories: applicableCategories || [],
      createdBy: req.user.id,
    });

    await offer.save();

    const populatedOffer = await Offer.findById(offer._id).populate(
      "createdBy",
      "name email",
    );

    res.status(201).json(populatedOffer);
  } catch (error) {
    console.error("Create offer error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update offer (admin only)
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert date strings to Date objects
    if (updateData.validFrom) {
      updateData.validFrom = new Date(updateData.validFrom);
    }
    if (updateData.validUntil) {
      updateData.validUntil = new Date(updateData.validUntil);
    }

    // Validate dates if both are provided
    if (updateData.validFrom && updateData.validUntil) {
      if (updateData.validFrom >= updateData.validUntil) {
        return res.status(400).json({
          message: "Valid from date must be before valid until date",
        });
      }
    }

    const offer = await Offer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.json(offer);
  } catch (error) {
    console.error("Update offer error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete offer (admin only)
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findByIdAndDelete(id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.error("Delete offer error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Toggle offer status (admin only)
const toggleOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    const populatedOffer = await Offer.findById(offer._id).populate(
      "createdBy",
      "name email",
    );

    res.json(populatedOffer);
  } catch (error) {
    console.error("Toggle offer status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get offer by ID
const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findById(id).populate("createdBy", "name email");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.json(offer);
  } catch (error) {
    console.error("Get offer by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Apply offer to order (calculate discount)
const applyOfferToOrder = async (req, res) => {
  try {
    const { offerId, orderAmount, categories } = req.body;

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (!offer.isCurrentlyValid) {
      return res.status(400).json({ message: "Offer is not currently valid" });
    }

    if (!offer.isApplicableToOrder(orderAmount, categories)) {
      return res.status(400).json({
        message: "Offer is not applicable to this order",
      });
    }

    const discountAmount = offer.calculateDiscount(orderAmount);

    res.json({
      offerId: offer._id,
      title: offer.title,
      discountType: offer.discountType,
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    });
  } catch (error) {
    console.error("Apply offer error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOffers,
  getActiveOffers,
  getModalOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  getOfferById,
  applyOfferToOrder,
};
