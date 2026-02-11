const User = require("../models/User");
const PointsTransaction = require("../models/PointsTransaction");
const Order = require("../models/Order");
const { logActivity } = require("../utils/activityLogger");

// Points earning rules
const POINTS_RULES = {
  ORDER_MULTIPLIER: 0.01, // 1 point per 100 BDT
  FIRST_ORDER_BONUS: 500,
  REVIEW_BONUS: 50,
  REFERRAL_REFERRER: 200,
  REFERRAL_REFEREE: 100,
  POINTS_TO_BDT: 1, // 1 point = 1 BDT
};

// GET /api/loyalty/balance - Get user's loyalty points balance
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("loyaltyPoints");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize loyalty points if not present (for existing users)
    if (!user.loyaltyPoints) {
      user.loyaltyPoints = {
        balance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        tier: "bronze",
        lastUpdated: new Date(),
      };
      await user.save();
    }

    res.json({
      balance: user.loyaltyPoints.balance || 0,
      totalEarned: user.loyaltyPoints.totalEarned || 0,
      totalRedeemed: user.loyaltyPoints.totalRedeemed || 0,
      tier: user.loyaltyPoints.tier || "bronze",
      lastUpdated: user.loyaltyPoints.lastUpdated || new Date(),
    });
  } catch (error) {
    console.error("Get balance error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/loyalty/transactions - Get user's points transaction history
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const query = { userId: req.user.id };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      PointsTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("orderId", "orderNumber total")
        .populate("referralId", "name email")
        .lean(),
      PointsTransaction.countDocuments(query),
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/loyalty/redeem - Redeem points for discount
exports.redeemPoints = async (req, res) => {
  try {
    const { points, orderId } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ message: "Invalid points amount" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.loyaltyPoints.balance < points) {
      return res.status(400).json({ message: "Insufficient points balance" });
    }

    // Calculate discount value
    const discountValue = points * POINTS_RULES.POINTS_TO_BDT;

    // Deduct points
    user.loyaltyPoints.balance -= points;
    user.loyaltyPoints.totalRedeemed += points;
    user.loyaltyPoints.lastUpdated = new Date();
    await user.save();

    // Create transaction record
    const transaction = await PointsTransaction.create({
      userId: req.user.id,
      type: "redeemed",
      points: -points,
      description: `Redeemed ${points} points for ${discountValue} BDT discount`,
      orderId: orderId || null,
      metadata: { discountValue },
    });

    await logActivity({
      userId: req.user.id,
      action: "POINTS_REDEEMED",
      meta: { points, discountValue, orderId },
      req,
    });

    res.json({
      message: "Points redeemed successfully",
      pointsRedeemed: points,
      discountValue,
      newBalance: user.loyaltyPoints.balance,
      transaction,
    });
  } catch (error) {
    console.error("Redeem points error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/loyalty/earn - Award points (internal use or admin)
exports.awardPoints = async (req, res) => {
  try {
    const { userId, points, type, description, orderId, referralId } = req.body;

    if (!userId || !points || !type || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add points
    user.loyaltyPoints.balance += points;
    user.loyaltyPoints.totalEarned += points;
    user.loyaltyPoints.lastUpdated = new Date();

    // Update tier
    user.updateLoyaltyTier();
    await user.save();

    // Create transaction record
    const transaction = await PointsTransaction.create({
      userId,
      type,
      points,
      description,
      orderId: orderId || null,
      referralId: referralId || null,
    });

    await logActivity({
      userId: req.user.id,
      action: "POINTS_AWARDED",
      meta: { targetUserId: userId, points, type },
      req,
    });

    res.json({
      message: "Points awarded successfully",
      pointsAwarded: points,
      newBalance: user.loyaltyPoints.balance,
      tier: user.loyaltyPoints.tier,
      transaction,
    });
  } catch (error) {
    console.error("Award points error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/loyalty/rules - Get points earning rules
exports.getRules = async (req, res) => {
  try {
    res.json({
      rules: {
        orderMultiplier: POINTS_RULES.ORDER_MULTIPLIER,
        orderDescription: "Earn 1 point for every 100 BDT spent",
        firstOrderBonus: POINTS_RULES.FIRST_ORDER_BONUS,
        reviewBonus: POINTS_RULES.REVIEW_BONUS,
        referralReferrer: POINTS_RULES.REFERRAL_REFERRER,
        referralReferee: POINTS_RULES.REFERRAL_REFEREE,
        pointsToBdt: POINTS_RULES.POINTS_TO_BDT,
        redemptionDescription: "1 point = 1 BDT discount",
      },
      tiers: [
        { name: "bronze", minPoints: 0, benefits: "Standard rewards" },
        { name: "silver", minPoints: 2000, benefits: "5% bonus points" },
        { name: "gold", minPoints: 5000, benefits: "10% bonus points" },
        {
          name: "platinum",
          minPoints: 10000,
          benefits: "15% bonus points + exclusive offers",
        },
      ],
    });
  } catch (error) {
    console.error("Get rules error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to award points for order (called from order controller)
exports.awardPointsForOrder = async (userId, orderId, orderTotal) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Check if this is first order
    const orderCount = await Order.countDocuments({
      userId,
      status: "delivered",
    });
    const isFirstOrder = orderCount === 1;

    // Calculate points
    let points = Math.floor(orderTotal * POINTS_RULES.ORDER_MULTIPLIER);

    // Add first order bonus
    if (isFirstOrder) {
      points += POINTS_RULES.FIRST_ORDER_BONUS;
    }

    // Apply tier bonus
    const tierBonus = {
      bronze: 0,
      silver: 0.05,
      gold: 0.1,
      platinum: 0.15,
    };
    const bonus = Math.floor(
      points * (tierBonus[user.loyaltyPoints.tier] || 0),
    );
    points += bonus;

    // Award points
    user.loyaltyPoints.balance += points;
    user.loyaltyPoints.totalEarned += points;
    user.loyaltyPoints.lastUpdated = new Date();
    user.updateLoyaltyTier();
    await user.save();

    // Create transaction
    await PointsTransaction.create({
      userId,
      type: "earned",
      points,
      description: isFirstOrder
        ? `Earned ${points} points (${points - POINTS_RULES.FIRST_ORDER_BONUS} from order + ${POINTS_RULES.FIRST_ORDER_BONUS} first order bonus)`
        : `Earned ${points} points from order`,
      orderId,
      metadata: { orderTotal, isFirstOrder, tierBonus: bonus },
    });

    return points;
  } catch (error) {
    console.error("Award points for order error:", error);
  }
};

// Helper function to award points for review
exports.awardPointsForReview = async (userId, reviewId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const points = POINTS_RULES.REVIEW_BONUS;

    user.loyaltyPoints.balance += points;
    user.loyaltyPoints.totalEarned += points;
    user.loyaltyPoints.lastUpdated = new Date();
    user.updateLoyaltyTier();
    await user.save();

    await PointsTransaction.create({
      userId,
      type: "review",
      points,
      description: `Earned ${points} points for writing a review`,
      metadata: { reviewId },
    });

    return points;
  } catch (error) {
    console.error("Award points for review error:", error);
  }
};

module.exports.POINTS_RULES = POINTS_RULES;
