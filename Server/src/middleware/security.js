// Security middleware for XSS, NoSQL injection, and other attacks
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// Sanitize data to prevent NoSQL injection
const sanitizeData = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key: ${key} in request from ${req.ip}`);
  },
});

// Prevent XSS attacks by cleaning user input
const preventXSS = xss();

// Prevent HTTP Parameter Pollution
const preventHPP = hpp({
  whitelist: ["price", "rating", "category", "sort", "limit", "page"],
});

module.exports = {
  sanitizeData,
  preventXSS,
  preventHPP,
};
