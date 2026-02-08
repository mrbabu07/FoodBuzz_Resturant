// Rate limiting middleware to prevent abuse and DDoS attacks
const rateLimit = require("express-rate-limit");

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes",
    });
  },
});

// Strict limiter for authentication routes - 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
    retryAfter: "15 minutes",
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      message:
        "Too many login attempts. Your account has been temporarily locked for security.",
      retryAfter: "15 minutes",
    });
  },
});

// Upload limiter - 20 uploads per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: {
    message: "Too many file uploads from this IP, please try again later.",
    retryAfter: "1 hour",
  },
  handler: (req, res) => {
    res.status(429).json({
      message: "Upload limit exceeded. Please try again in an hour.",
      retryAfter: "1 hour",
    });
  },
});

// Password reset limiter - 3 attempts per hour
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    message: "Too many password reset attempts, please try again later.",
    retryAfter: "1 hour",
  },
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many password reset attempts. Please try again in an hour.",
      retryAfter: "1 hour",
    });
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  passwordResetLimiter,
};
