const mongoose = require("mongoose");

// Cache the connection to reuse across serverless function calls
let cachedConnection = null;

const connectDB = async () => {
  // If already connected, return cached connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    // Optimized connection options for Vercel serverless
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 10000,
      retryWrites: true,
      w: "majority",
    };

    const conn = await mongoose.connect(
      process.env.MONGO_URI || process.env.MONGODB_URI,
      options,
    );

    cachedConnection = conn;
    console.log("MongoDB connected successfully");
    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Don't exit in serverless - just throw error
    throw error;
  }
};

module.exports = connectDB;
