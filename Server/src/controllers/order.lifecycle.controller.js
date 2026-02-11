// Server/src/controllers/order.lifecycle.controller.js
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const { sendNotification } = require("../utils/notificationService");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Cancel Order
 * POST /api/orders/:id/cancel
 * Allows cancellation before "Processing" status
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order (or is admin/staff)
    if (
      order.userId.toString() !== req.user._id.toString() &&
      !["admin", "staff"].includes(req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ["Placed", "Scheduled", "Pending"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.status}. Order is already being prepared.`,
      });
    }

    // Check time limit (5 minutes for customer, unlimited for admin/staff)
    if (req.user.role === "customer") {
      const orderTime = new Date(order.createdAt);
      const now = new Date();
      const minutesPassed = (now - orderTime) / 1000 / 60;

      if (minutesPassed > 5) {
        return res.status(400).json({
          message: "Order can only be cancelled within 5 minutes of placement",
        });
      }
    }

    // Process refund if paid via Stripe
    let refundStatus = null;
    if (order.paymentMethod === "Stripe" && order.stripePaymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          reason: "requested_by_customer",
        });

        refundStatus = {
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          processedAt: new Date(),
        };

        // Update payment record
        await Payment.findOneAndUpdate(
          { orderId: order._id },
          {
            status: "refunded",
            refundId: refund.id,
            refundAmount: refund.amount / 100,
            refundedAt: new Date(),
          },
        );
      } catch (stripeError) {
        console.error("Stripe refund error:", stripeError);
        return res.status(500).json({
          message: "Failed to process refund. Please contact support.",
        });
      }
    }

    // Update order
    order.status = "Cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = reason || "Customer requested cancellation";
    order.cancelledBy = req.user._id;
    order.refundStatus = refundStatus;
    await order.save();

    // Send notification
    try {
      await sendNotification({
        userId: order.userId,
        type: "order_cancelled",
        title: "Order Cancelled",
        message: `Your order #${order._id} has been cancelled${refundStatus ? " and refund is being processed" : ""}.`,
        data: { orderId: order._id.toString() },
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
      refund: refundStatus,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

/**
 * Request Return/Refund
 * POST /api/orders/:id/return
 * Customer can request return after delivery
 */
exports.requestReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description, images } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check ownership
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order is delivered
    if (order.status !== "Delivered" && order.status !== "Completed") {
      return res.status(400).json({
        message: "Return can only be requested for delivered orders",
      });
    }

    // Check time limit (24 hours)
    const deliveredTime = order.deliveredAt || order.updatedAt;
    const hoursPassed = (new Date() - new Date(deliveredTime)) / 1000 / 60 / 60;

    if (hoursPassed > 24) {
      return res.status(400).json({
        message: "Return can only be requested within 24 hours of delivery",
      });
    }

    // Check if already requested
    if (order.returnRequest) {
      return res.status(400).json({
        message: "Return request already submitted",
      });
    }

    // Create return request
    order.returnRequest = {
      reason,
      description,
      images: images || [],
      requestedAt: new Date(),
      status: "pending", // pending, approved, rejected
    };
    await order.save();

    // Notify admin
    try {
      await sendNotification({
        userId: order.userId,
        type: "return_requested",
        title: "Return Request Submitted",
        message: `Your return request for order #${order._id} is being reviewed.`,
        data: { orderId: order._id.toString() },
      });
    } catch (notifError) {
      console.error("Notification error:", notifError);
    }

    res.json({
      success: true,
      message: "Return request submitted successfully",
      order,
    });
  } catch (error) {
    console.error("Return request error:", error);
    res.status(500).json({
      message: "Failed to submit return request",
      error: error.message,
    });
  }
};

/**
 * Get Order Timeline
 * GET /api/orders/:id/timeline
 * Returns status history with timestamps
 */
exports.getOrderTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Build timeline from order data
    const timeline = [
      {
        status: "Placed",
        timestamp: order.createdAt,
        description: "Order placed successfully",
        icon: "🛒",
      },
    ];

    // Add status updates based on current status
    const statusFlow = {
      Scheduled: { description: "Order scheduled", icon: "📅" },
      Processing: {
        description: "Restaurant is preparing your order",
        icon: "👨‍🍳",
      },
      Ready: { description: "Order is ready for pickup/delivery", icon: "✅" },
      "Out for Delivery": { description: "Rider is on the way", icon: "🚴" },
      Delivered: { description: "Order delivered successfully", icon: "🎉" },
      Completed: { description: "Order completed", icon: "✔️" },
      Cancelled: {
        description: order.cancelReason || "Order cancelled",
        icon: "❌",
      },
    };

    // Add intermediate statuses based on current status
    if (order.status !== "Placed" && order.status !== "Cancelled") {
      const statuses = ["Processing", "Ready", "Out for Delivery", "Delivered"];
      const currentIndex = statuses.indexOf(order.status);

      statuses.forEach((status, index) => {
        if (index <= currentIndex) {
          timeline.push({
            status,
            timestamp: order.updatedAt, // In real app, track each status change
            description: statusFlow[status].description,
            icon: statusFlow[status].icon,
          });
        }
      });
    }

    if (order.status === "Cancelled") {
      timeline.push({
        status: "Cancelled",
        timestamp: order.cancelledAt || order.updatedAt,
        description: statusFlow.Cancelled.description,
        icon: statusFlow.Cancelled.icon,
      });
    }

    res.json({
      success: true,
      timeline,
      currentStatus: order.status,
    });
  } catch (error) {
    console.error("Get timeline error:", error);
    res.status(500).json({
      message: "Failed to fetch order timeline",
      error: error.message,
    });
  }
};
