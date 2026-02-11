const User = require("../models/User");
const PointsTransaction = require("../models/PointsTransaction");
const { logActivity } = require("../utils/activityLogger");
const { POINTS_RULES } = require("./loyalty.controller");

// GET /api/referral/code - Get user's referral code
exports.getReferralCode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "referralCode referralStats",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate referral code if not present (for existing users)
    if (!user.referralCode) {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }
      user.referralCode = code;
      await user.save();
    }

    // Initialize referral stats if not present
    if (!user.referralStats) {
      user.referralStats = {
        totalReferrals: 0,
        successfulReferrals: 0,
        rewardsEarned: 0,
      };
      await user.save();
    }

    res.json({
      referralCode: user.referralCode,
      stats: user.referralStats,
      shareUrl: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
    });
  } catch (error) {
    console.error("Get referral code error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/referral/referrals - Get user's referral list
exports.getReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [referrals, total] = await Promise.all([
      User.find({ referredBy: req.user.id })
        .select("name email createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments({ referredBy: req.user.id }),
    ]);

    res.json({
      referrals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/referral/validate - Validate referral code
exports.validateReferralCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Referral code is required" });
    }

    const referrer = await User.findOne({
      referralCode: code.toUpperCase(),
    }).select("name referralCode");

    if (!referrer) {
      return res.status(404).json({ message: "Invalid referral code" });
    }

    res.json({
      valid: true,
      referrerName: referrer.name,
      bonus: POINTS_RULES.REFERRAL_REFEREE,
    });
  } catch (error) {
    console.error("Validate referral code error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to process referral (called during registration)
exports.processReferral = async (newUserId, referralCode) => {
  try {
    if (!referralCode) return;

    const referrer = await User.findOne({
      referralCode: referralCode.toUpperCase(),
    });

    if (!referrer) return;

    // Update new user with referrer
    const newUser = await User.findById(newUserId);
    if (!newUser) return;

    newUser.referredBy = referrer._id;

    // Award welcome bonus to new user
    newUser.loyaltyPoints.balance += POINTS_RULES.REFERRAL_REFEREE;
    newUser.loyaltyPoints.totalEarned += POINTS_RULES.REFERRAL_REFEREE;
    newUser.loyaltyPoints.lastUpdated = new Date();
    await newUser.save();

    // Create transaction for new user
    await PointsTransaction.create({
      userId: newUserId,
      type: "referral",
      points: POINTS_RULES.REFERRAL_REFEREE,
      description: `Welcome bonus for using referral code ${referralCode}`,
      referralId: referrer._id,
    });

    // Update referrer stats
    referrer.referralStats.totalReferrals += 1;
    await referrer.save();

    return true;
  } catch (error) {
    console.error("Process referral error:", error);
    return false;
  }
};

// Helper function to award referrer when referee makes first order
exports.awardReferrerBonus = async (userId) => {
  try {
    const user = await User.findById(userId).populate("referredBy");

    if (!user || !user.referredBy) return;

    const referrer = user.referredBy;

    // Check if referrer already got bonus for this user
    const existingBonus = await PointsTransaction.findOne({
      userId: referrer._id,
      type: "referral",
      referralId: userId,
      description: { $regex: /first order/ },
    });

    if (existingBonus) return; // Already awarded

    // Award points to referrer
    referrer.loyaltyPoints.balance += POINTS_RULES.REFERRAL_REFERRER;
    referrer.loyaltyPoints.totalEarned += POINTS_RULES.REFERRAL_REFERRER;
    referrer.loyaltyPoints.lastUpdated = new Date();
    referrer.referralStats.successfulReferrals += 1;
    referrer.referralStats.rewardsEarned += POINTS_RULES.REFERRAL_REFERRER;
    referrer.updateLoyaltyTier();
    await referrer.save();

    // Create transaction
    await PointsTransaction.create({
      userId: referrer._id,
      type: "referral",
      points: POINTS_RULES.REFERRAL_REFERRER,
      description: `Referral bonus - ${user.name} completed their first order`,
      referralId: userId,
    });

    return POINTS_RULES.REFERRAL_REFERRER;
  } catch (error) {
    console.error("Award referrer bonus error:", error);
  }
};

// GET /api/referral/leaderboard - Get top referrers
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topReferrers = await User.find({ role: "user" })
      .select("name referralStats")
      .sort({ "referralStats.successfulReferrals": -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      leaderboard: topReferrers.map((user, index) => ({
        rank: index + 1,
        name: user.name,
        successfulReferrals: user.referralStats.successfulReferrals,
        rewardsEarned: user.referralStats.rewardsEarned,
      })),
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.processReferral = exports.processReferral;
module.exports.awardReferrerBonus = exports.awardReferrerBonus;
