const FlashDeal = require("../models/FlashDeal");
const MenuItem = require("../models/MenuItem");
const { logActivity } = require("../utils/activityLogger");

// GET /api/flash-deals - Get active flash deals
exports.getActiveDeals = async (req, res) => {
  try {
    const now = new Date();

    const deals = await FlashDeal.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    })
      .populate("menuItemId", "name description image category")
      .sort({ priority: -1, startTime: 1 })
      .lean();

    // Filter out sold out deals
    const availableDeals = deals.filter((deal) => {
      return deal.maxQuantity === null || deal.soldQuantity < deal.maxQuantity;
    });

    res.json({ deals: availableDeals });
  } catch (error) {
    console.error("Get active deals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/flash-deals/:id - Get single flash deal
exports.getDeal = async (req, res) => {
  try {
    const deal = await FlashDeal.findById(req.params.id).populate(
      "menuItemId",
      "name description image category price",
    );

    if (!deal) {
      return res.status(404).json({ message: "Flash deal not found" });
    }

    res.json({ deal });
  } catch (error) {
    console.error("Get deal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/flash-deals/:id/click - Track click
exports.trackClick = async (req, res) => {
  try {
    const deal = await FlashDeal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Flash deal not found" });
    }

    deal.clickCount += 1;
    await deal.save();

    res.json({ message: "Click tracked" });
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/flash-deals/:id/convert - Track conversion
exports.trackConversion = async (req, res) => {
  try {
    const deal = await FlashDeal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Flash deal not found" });
    }

    deal.conversionCount += 1;
    deal.soldQuantity += req.body.quantity || 1;
    await deal.save();

    res.json({ message: "Conversion tracked" });
  } catch (error) {
    console.error("Track conversion error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin routes

// POST /api/admin/flash-deals - Create flash deal
exports.createDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      menuItemId,
      discountType,
      discountValue,
      startTime,
      endTime,
      maxQuantity,
    } = req.body;

    // Get menu item to calculate prices
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const originalPrice = menuItem.price;
    let dealPrice;

    if (discountType === "percentage") {
      dealPrice = originalPrice * (1 - discountValue / 100);
    } else {
      dealPrice = originalPrice - discountValue;
    }

    const deal = await FlashDeal.create({
      title,
      description,
      menuItemId,
      discountType,
      discountValue,
      originalPrice,
      dealPrice,
      startTime,
      endTime,
      maxQuantity: maxQuantity || null,
    });

    await logActivity({
      userId: req.user.id,
      action: "FLASH_DEAL_CREATED",
      meta: { dealId: deal._id, title },
      req,
    });

    res.status(201).json({
      message: "Flash deal created successfully",
      deal,
    });
  } catch (error) {
    console.error("Create deal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/flash-deals/:id - Update flash deal
exports.updateDeal = async (req, res) => {
  try {
    const deal = await FlashDeal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!deal) {
      return res.status(404).json({ message: "Flash deal not found" });
    }

    await logActivity({
      userId: req.user.id,
      action: "FLASH_DEAL_UPDATED",
      meta: { dealId: deal._id },
      req,
    });

    res.json({
      message: "Flash deal updated successfully",
      deal,
    });
  } catch (error) {
    console.error("Update deal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/flash-deals/:id - Delete flash deal
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await FlashDeal.findByIdAndDelete(req.params.id);

    if (!deal) {
      return res.status(404).json({ message: "Flash deal not found" });
    }

    await logActivity({
      userId: req.user.id,
      action: "FLASH_DEAL_DELETED",
      meta: { dealId: deal._id, title: deal.title },
      req,
    });

    res.json({ message: "Flash deal deleted successfully" });
  } catch (error) {
    console.error("Delete deal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/flash-deals - Get all flash deals (admin)
exports.getAllDeals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    const now = new Date();

    if (status === "active") {
      query = {
        isActive: true,
        startTime: { $lte: now },
        endTime: { $gte: now },
      };
    } else if (status === "upcoming") {
      query = { isActive: true, startTime: { $gt: now } };
    } else if (status === "expired") {
      query = { endTime: { $lt: now } };
    }

    const [deals, total] = await Promise.all([
      FlashDeal.find(query)
        .populate("menuItemId", "name image category")
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      FlashDeal.countDocuments(query),
    ]);

    res.json({
      deals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all deals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
