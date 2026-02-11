const mongoose = require("mongoose");
const os = require("os");

// GET /api/health - Basic health check
exports.healthCheck = async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
};

// GET /api/health/detailed - Detailed health check
exports.detailedHealthCheck = async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    const health = {
      status: dbStatus === "connected" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        database: {
          status: dbStatus,
          name: mongoose.connection.name,
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: "MB",
        },
        cpu: {
          usage: process.cpuUsage(),
          cores: os.cpus().length,
        },
      },
      version: process.env.npm_package_version || "1.0.0",
    };

    const statusCode = health.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// GET /api/health/ready - Readiness probe (for Kubernetes/Docker)
exports.readinessCheck = async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ready: false,
        reason: "Database not connected",
      });
    }

    // Check if critical services are available
    // Add more checks as needed

    res.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message,
    });
  }
};

// GET /api/health/live - Liveness probe (for Kubernetes/Docker)
exports.livenessCheck = async (req, res) => {
  // Simple check to see if the server is running
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
};

// GET /api/metrics - Basic metrics (for monitoring)
exports.getMetrics = async (req, res) => {
  try {
    const User = require("../models/User");
    const Order = require("../models/Order");
    const MenuItem = require("../models/MenuItem");

    const [userCount, orderCount, menuItemCount] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      MenuItem.countDocuments(),
    ]);

    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB",
      },
      database: {
        users: userCount,
        orders: orderCount,
        menuItems: menuItemCount,
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        cpus: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024),
        freeMemory: Math.round(os.freemem() / 1024 / 1024),
        unit: "MB",
      },
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: "Failed to collect metrics",
      message: error.message,
    });
  }
};
