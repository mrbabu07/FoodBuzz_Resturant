// Payment Controller - Stripe Integration
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("⚠️ STRIPE_SECRET_KEY not found in environment variables");
  } else {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    console.log("✅ Stripe initialized successfully");
  }
} catch (error) {
  console.error("❌ Failed to initialize Stripe:", error.message);
}

const Payment = require("../models/Payment");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const { sendEmail } = require("../utils/mailer");

// Create Checkout Session (Direct from cart - no order yet)
exports.createDirectCheckout = async (req, res) => {
  try {
    console.log("📦 Create direct checkout called");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    if (!stripe) {
      console.error("❌ Stripe not initialized");
      return res.status(500).json({ message: "Payment system not configured" });
    }

    const { items, deliveryFee, customerEmail, metadata } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd", // Changed to USD for testing (BDT has 50 BDT minimum)
        product_data: {
          name: item.name,
          description: `Quantity: ${item.quantity}`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add delivery fee if applicable
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // Calculate total
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const total = subtotal + (deliveryFee || 0);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/place_order`,
      customer_email: customerEmail || req.user.email,
      metadata: {
        userId: userId.toString(),
        orderId: metadata?.orderId || "",
        deliveryAddress: metadata?.deliveryAddress || "",
        phone: metadata?.phone || "",
        customerName: metadata?.customerName || "",
        items: JSON.stringify(
          items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price })),
        ),
        deliveryFee: deliveryFee || 0,
      },
    });

    // Create payment record in database
    const payment = await Payment.create({
      orderId: metadata?.orderId || null,
      userId: userId,
      paymentMethod: "stripe",
      status: "pending",
      amount: total,
      currency: "USD",
      stripeSessionId: session.id,
      metadata: {
        sessionUrl: session.url,
        items: items.map((i) => ({
          name: i.name,
          qty: i.quantity,
          price: i.price,
        })),
        deliveryFee: deliveryFee || 0,
      },
    });

    console.log("✅ Payment record created:", payment._id);

    res.json({
      message: "Checkout session created",
      sessionId: session.id,
      url: session.url,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Create direct checkout error:", error);
    res.status(500).json({
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

// Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    // Get order details
    const order = await Order.findById(orderId).populate("items.menuItemId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order is already paid
    if (order.paymentStatus === "completed") {
      return res.status(400).json({ message: "Order already paid" });
    }

    // Create line items for Stripe
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "bdt", // Bangladesh Taka
        product_data: {
          name: item.name,
          description: `Quantity: ${item.qty}`,
          images: item.imageUrl ? [item.imageUrl] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.qty,
    }));

    // Add delivery fee if applicable
    if (order.deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "bdt",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: Math.round(order.deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.PAYMENT_CANCEL_URL}?order_id=${orderId}`,
      customer_email: req.user.email,
      client_reference_id: orderId.toString(),
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString(),
      },
    });

    // Create payment record
    const payment = await Payment.create({
      orderId: orderId,
      userId: userId,
      paymentMethod: "stripe",
      status: "pending",
      amount: order.total,
      currency: "BDT",
      stripeSessionId: session.id,
      metadata: {
        sessionUrl: session.url,
      },
    });

    // Update order with payment info
    order.paymentId = payment._id;
    order.paymentStatus = "processing";
    await order.save();

    res.json({
      message: "Checkout session created",
      sessionId: session.id,
      sessionUrl: session.url,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

// Verify Payment (after redirect from Stripe)
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID required" });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Find payment record
    const payment = await Payment.findOne({ stripeSessionId: sessionId });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Update payment status based on Stripe session
    if (session.payment_status === "paid") {
      payment.status = "completed";
      payment.paidAt = new Date();
      payment.stripePaymentIntentId = session.payment_intent;
      await payment.save();

      // Update order status
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.paymentStatus = "completed";
        order.status = "Confirmed";
        order.statusHistory.push({ status: "Confirmed", at: new Date() });
        await order.save();

        // Send confirmation email
        try {
          await sendEmail({
            to: req.user.email,
            subject: "Payment Successful - FoodBuzz",
            html: `
              <h2>Payment Successful!</h2>
              <p>Your payment of ৳${payment.amount} has been received.</p>
              <p>Order ID: ${order._id}</p>
              <p>Your order is now being prepared.</p>
              <p>Thank you for your order!</p>
            `,
          });
        } catch (emailError) {
          console.error("Email send error:", emailError);
        }
      }

      res.json({
        message: "Payment verified successfully",
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          paidAt: payment.paidAt,
        },
        order: {
          id: order._id,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
      });
    } else {
      payment.status = "failed";
      payment.failedAt = new Date();
      payment.errorMessage = "Payment not completed";
      await payment.save();

      res.status(400).json({
        message: "Payment not completed",
        status: session.payment_status,
      });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

// Get Payment Details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId)
      .populate("orderId")
      .populate("userId", "name email");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Verify user owns this payment (or is admin/staff)
    if (
      payment.userId._id.toString() !== userId &&
      !["admin", "staff"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Get payment details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get User's Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 20, page = 1 } = req.query;

    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate("orderId", "items total status")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Refund Payment (Admin only)
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason, amount } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Can only refund completed payments" });
    }

    if (payment.paymentMethod !== "stripe") {
      return res.status(400).json({
        message: "Only Stripe payments can be refunded automatically",
      });
    }

    // Create refund in Stripe
    const refundAmount = amount || payment.amount;
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: "requested_by_customer",
      metadata: {
        paymentId: paymentId.toString(),
        reason: reason || "Customer request",
      },
    });

    // Update payment record
    payment.status = "refunded";
    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    payment.metadata.refundId = refund.id;
    await payment.save();

    // Update order
    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = "refunded";
      order.status = "Cancelled";
      order.statusHistory.push({ status: "Cancelled", at: new Date() });
      await order.save();
    }

    // Send refund email
    try {
      const user = await require("../models/User").findById(payment.userId);
      await sendEmail({
        to: user.email,
        subject: "Refund Processed - FoodBuzz",
        html: `
          <h2>Refund Processed</h2>
          <p>Your refund of ৳${refundAmount} has been processed.</p>
          <p>Reason: ${reason || "Customer request"}</p>
          <p>The amount will be credited to your original payment method within 5-10 business days.</p>
        `,
      });
    } catch (emailError) {
      console.error("Refund email error:", emailError);
    }

    res.json({
      message: "Refund processed successfully",
      payment: {
        id: payment._id,
        status: payment.status,
        refundAmount: payment.refundAmount,
        refundedAt: payment.refundedAt,
      },
      refund: {
        id: refund.id,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error("Refund payment error:", error);
    res.status(500).json({
      message: "Failed to process refund",
      error: error.message,
    });
  }
};

// Stripe Webhook Handler
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      await handlePaymentIntentFailed(failedPayment);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Helper function: Handle checkout session completed
async function handleCheckoutSessionCompleted(session) {
  try {
    const payment = await Payment.findOne({ stripeSessionId: session.id });

    if (payment && payment.status === "pending") {
      payment.status = "completed";
      payment.paidAt = new Date();
      payment.stripePaymentIntentId = session.payment_intent;
      await payment.save();

      // Update order
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.paymentStatus = "completed";
        order.status = "Confirmed";
        order.statusHistory.push({ status: "Confirmed", at: new Date() });
        await order.save();
      }
    }
  } catch (error) {
    console.error("Handle checkout session completed error:", error);
  }
}

// Helper function: Handle payment intent succeeded
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (payment) {
      payment.status = "completed";
      payment.paidAt = new Date();
      payment.stripeChargeId = paymentIntent.charges.data[0]?.id;
      await payment.save();
    }
  } catch (error) {
    console.error("Handle payment intent succeeded error:", error);
  }
}

// Helper function: Handle payment intent failed
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (payment) {
      payment.status = "failed";
      payment.failedAt = new Date();
      payment.errorMessage =
        paymentIntent.last_payment_error?.message || "Payment failed";
      payment.errorCode = paymentIntent.last_payment_error?.code;
      await payment.save();

      // Update order
      const order = await Order.findById(payment.orderId);
      if (order) {
        order.paymentStatus = "failed";
        await order.save();
      }
    }
  } catch (error) {
    console.error("Handle payment intent failed error:", error);
  }
}

// Get Payment Statistics (Admin only)
exports.getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { ...filter, status: "completed" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      stats,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
