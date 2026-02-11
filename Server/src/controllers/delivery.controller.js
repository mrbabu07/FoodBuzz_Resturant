// Server/src/controllers/delivery.controller.js
const Order = require("../models/Order");
const Rider = require("../models/Rider");
const DeliveryZone = require("../models/DeliveryZone");
const { sendNotification } = require("../utils/notificationService");

/**
 * Assign Rider to Order
 * POST /api/delivery/assign
 * Admin/Staff assigns available rider to order
 */
exports.assignRider = async (req, res) => {
  try {
    const { orderId, riderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    if (rider.status !== "available") {
      return res.status(400).json({ message: "Rider is not available" });
    }

    // Assign rider
    order.riderId = riderId;
    order.riderName = rider.name;
    order.riderPhone = rider.phone;
    order.status = "Out for Delivery";
    order.assignedAt = new Date();
    await order.save();

    // Update rider status
    rider.status = "busy";
    rider.activeDeliveries += 1;
    await rider.save();

    // Notify customer
    try {
      await sendNotification({
        userId: order.userId,
        type: "rider_assigned",
        title: "Rider Assigned",
        message: `${rider.name} is delivering your order. Contact: ${rider.phone}`,
        data: { orderId: order._id.toString(), riderId: rider._id.toString() },
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.json({
      success: true,
      message: "Rider assigned successfully",
      order,
      rider: {
        id: rider._id,
        name: rider.name,
        phone: rider.phone,
        vehicleType: rider.vehicleType,
      },
    });
  } catch (error) {
    console.error("Assign rider error:", error);
    res.status(500).json({
      message: "Failed to assign rider",
      error: error.message,
    });
  }
};

/**
 * Get Available Riders
 * GET /api/delivery/riders/available
 */
exports.getAvailableRiders = async (req, res) => {
  try {
    const { zone } = req.query;

    const filter = { status: "available", isActive: true };

    if (zone) {
      filter.deliveryZones = zone;
    }

    const riders = await Rider.find(filter)
      .select("name phone vehicleType rating totalDeliveries currentLocation")
      .sort({ rating: -1, totalDeliveries: -1 });

    res.json({
      success: true,
      count: riders.length,
      riders,
    });
  } catch (error) {
    console.error("Get available riders error:", error);
    res.status(500).json({
      message: "Failed to fetch available riders",
      error: error.message,
    });
  }
};

/**
 * Update Rider Location
 * PUT /api/delivery/location
 * Rider updates their current location
 */
exports.updateRiderLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const rider = await Rider.findOne({ userId: req.user._id });
    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    rider.currentLocation = {
      latitude,
      longitude,
      updatedAt: new Date(),
    };
    await rider.save();

    res.json({
      success: true,
      message: "Location updated",
      location: rider.currentLocation,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({
      message: "Failed to update location",
      error: error.message,
    });
  }
};

/**
 * Complete Delivery
 * POST /api/delivery/:orderId/complete
 * Rider marks delivery as completed
 */
exports.completeDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryNotes, customerSignature } = req.body;

    const rider = await Rider.findOne({ userId: req.user._id });
    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.riderId.toString() !== rider._id.toString()) {
      return res.status(403).json({ message: "Not assigned to this order" });
    }

    // Update order
    order.status = "Delivered";
    order.deliveredAt = new Date();
    order.deliveryNotes = deliveryNotes;
    await order.save();

    // Update rider
    rider.status = "available";
    rider.activeDeliveries -= 1;
    rider.totalDeliveries += 1;

    // Calculate delivery fee (example: ৳50 per delivery)
    const deliveryFee = 50;
    rider.earnings.today += deliveryFee;
    rider.earnings.thisWeek += deliveryFee;
    rider.earnings.thisMonth += deliveryFee;
    rider.earnings.total += deliveryFee;

    await rider.save();

    // Notify customer
    try {
      await sendNotification({
        userId: order.userId,
        type: "order_delivered",
        title: "Order Delivered",
        message: `Your order #${order._id} has been delivered. Enjoy your meal! 🎉`,
        data: { orderId: order._id.toString() },
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.json({
      success: true,
      message: "Delivery completed successfully",
      order,
      earnings: deliveryFee,
    });
  } catch (error) {
    console.error("Complete delivery error:", error);
    res.status(500).json({
      message: "Failed to complete delivery",
      error: error.message,
    });
  }
};

/**
 * Get Rider Dashboard Stats
 * GET /api/delivery/dashboard
 */
exports.getRiderDashboard = async (req, res) => {
  try {
    const rider = await Rider.findOne({ userId: req.user._id });
    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    // Get active deliveries
    const activeOrders = await Order.find({
      riderId: rider._id,
      status: { $in: ["Out for Delivery"] },
    }).select("_id items total deliveryAddress createdAt");

    // Get today's completed deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDeliveries = await Order.countDocuments({
      riderId: rider._id,
      status: "Delivered",
      deliveredAt: { $gte: today },
    });

    res.json({
      success: true,
      rider: {
        name: rider.name,
        status: rider.status,
        rating: rider.rating,
        totalDeliveries: rider.totalDeliveries,
        activeDeliveries: rider.activeDeliveries,
      },
      earnings: rider.earnings,
      todayDeliveries,
      activeOrders,
    });
  } catch (error) {
    console.error("Get rider dashboard error:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
};
