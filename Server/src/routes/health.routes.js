const express = require("express");
const router = express.Router();
const {
  healthCheck,
  detailedHealthCheck,
  readinessCheck,
  livenessCheck,
  getMetrics,
} = require("../controllers/health.controller");

// Public health checks
router.get("/", healthCheck);
router.get("/ready", readinessCheck);
router.get("/live", livenessCheck);

// Protected endpoints (add auth middleware if needed)
router.get("/detailed", detailedHealthCheck);
router.get("/metrics", getMetrics);

module.exports = router;
