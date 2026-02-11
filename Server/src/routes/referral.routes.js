const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const referralController = require("../controllers/referral.controller");

// Public routes
router.post("/validate", referralController.validateReferralCode);

// Authenticated routes
router.use(auth);

router.get("/code", referralController.getReferralCode);
router.get("/referrals", referralController.getReferrals);
router.get("/leaderboard", referralController.getLeaderboard);

module.exports = router;
