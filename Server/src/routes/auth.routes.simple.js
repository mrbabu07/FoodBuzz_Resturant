//path: backend_sara/roms-backend/src/routes/auth.routes.simple.js
// Auth routes WITHOUT rate limiting and activity logging
const router = require("express").Router();
const auth = require("../middleware/auth");
const { register, login } = require("../controllers/auth.controller.simple");
const {
  verifyEmail,
  resendVerification,
  checkVerification,
} = require("../controllers/email.verification.controller");
const {
  forgotPassword,
  resetPassword,
  validateResetToken,
} = require("../controllers/password.reset.controller");

// Registration & Login
router.post("/register", register);
router.post("/login", login);

// Email Verification
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", auth, resendVerification);
router.get("/check-verification", auth, checkVerification);

// Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/validate-reset-token", validateResetToken);

module.exports = router;
