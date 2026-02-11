const rateLimit = require("express-rate-limit");

// Rate limiter for authentication endpoints
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many login attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password reset
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: "Too many password reset attempts, please try again after an hour",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for API endpoints (per user)
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for sensitive operations
exports.strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: "Rate limit exceeded for this operation",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to check if email is verified
exports.requireEmailVerification = async (req, res, next) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select("emailVerified");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email address to access this feature",
        emailVerified: false,
      });
    }

    next();
  } catch (error) {
    console.error("Email verification check error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Sanitize user input to prevent XSS
exports.sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        // Remove potential XSS patterns
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

// Log suspicious activity
exports.logSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i, // Path traversal
    /(union|select|insert|update|delete|drop|create|alter)/i, // SQL injection
    /<script|javascript:|onerror=/i, // XSS
    /(\$ne|\$gt|\$lt|\$regex)/i, // NoSQL injection
  ];

  const checkString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      console.warn("⚠️ Suspicious activity detected:", {
        ip: req.ip,
        method: req.method,
        path: req.path,
        userId: req.user?.id,
        timestamp: new Date().toISOString(),
      });
      break;
    }
  }

  next();
};

// CORS configuration for production
exports.corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
