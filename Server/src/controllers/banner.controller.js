const PromoBanner = require("../models/PromoBanner");
const { logActivity } = require("../utils/activityLogger");

// GET /api/banners - Get active banners
exports.getActiveBanners = async (req, res) => {
  try {
    const now = new Date();
    const { targetAudience = "all" } = req.query;

    const query = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    // Filter by target audience if specified
    if (targetAudience !== "all") {
      query.$or = [
        { targetAudience: "all" },
        { targetAudience: targetAudience },
      ];
    }

    const banners = await PromoBanner.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    res.json({ banners });
  } catch (error) {
    console.error("Get active banners error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/banners/:id/impression - Track impression
exports.trackImpression = async (req, res) => {
  try {
    const banner = await PromoBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    banner.impressionCount += 1;
    await banner.save();

    res.json({ message: "Impression tracked" });
  } catch (error) {
    console.error("Track impression error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/banners/:id/click - Track click
exports.trackClick = async (req, res) => {
  try {
    const banner = await PromoBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    banner.clickCount += 1;
    await banner.save();

    res.json({ message: "Click tracked", linkUrl: banner.linkUrl });
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin routes

// POST /api/admin/banners - Create banner
exports.createBanner = async (req, res) => {
  try {
    const banner = await PromoBanner.create(req.body);

    await logActivity({
      userId: req.user.id,
      action: "BANNER_CREATED",
      meta: { bannerId: banner._id, title: banner.title },
      req,
    });

    res.status(201).json({
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    console.error("Create banner error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/banners/:id - Update banner
exports.updateBanner = async (req, res) => {
  try {
    const banner = await PromoBanner.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    await logActivity({
      userId: req.user.id,
      action: "BANNER_UPDATED",
      meta: { bannerId: banner._id },
      req,
    });

    res.json({
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    console.error("Update banner error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/banners/:id - Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await PromoBanner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    await logActivity({
      userId: req.user.id,
      action: "BANNER_DELETED",
      meta: { bannerId: banner._id, title: banner.title },
      req,
    });

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Delete banner error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/banners - Get all banners (admin)
exports.getAllBanners = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    const now = new Date();

    if (status === "active") {
      query = {
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      };
    } else if (status === "upcoming") {
      query = { isActive: true, startDate: { $gt: now } };
    } else if (status === "expired") {
      query = { endDate: { $lt: now } };
    }

    const [banners, total] = await Promise.all([
      PromoBanner.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      PromoBanner.countDocuments(query),
    ]);

    res.json({
      banners,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all banners error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/banners/:id/analytics - Get banner analytics
exports.getBannerAnalytics = async (req, res) => {
  try {
    const banner = await PromoBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const ctr =
      banner.impressionCount > 0
        ? ((banner.clickCount / banner.impressionCount) * 100).toFixed(2)
        : 0;

    res.json({
      bannerId: banner._id,
      title: banner.title,
      impressions: banner.impressionCount,
      clicks: banner.clickCount,
      ctr: parseFloat(ctr),
      isActive: banner.isCurrentlyActive(),
    });
  } catch (error) {
    console.error("Get banner analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
