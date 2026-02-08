//path: roms-backend/src/controllers/order.controller.js
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const mongoose = require("mongoose");

const User = require("../models/User");
const { sendMail } = require("../utils/mailer");
const { logActivity } = require("../utils/activityLogger");
const notificationService = require("../utils/notificationService");

const ALLOWED_STATUSES = [
  "Placed",
  "Processing",
  "Ready",
  "Delivered",
  "Completed",
  "Cancelled",
];

function makeInvoiceNo(orderId) {
  return "INV-" + String(orderId).slice(-6).toUpperCase();
}

function money(n) {
  const x = Number(n || 0);
  return Number.isFinite(x) ? x.toFixed(0) : "0";
}

function buildDeliveredInvoiceEmail({ order, user, trackUrl, receiptUrl }) {
  const invoiceNo = makeInvoiceNo(order._id);

  const itemsRows = (order.items || [])
    .map((it) => {
      const lineTotal = Number(it.price || 0) * Number(it.qty || 1);
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${it.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${it.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${money(it.price)} BDT</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${money(lineTotal)} BDT</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color:#222;">
      <h2 style="margin:0 0 8px;">✅ Order Delivered</h2>
      <p style="margin:0 0 12px;">Hi ${user?.name || "Customer"}, আপনার অর্ডারটি delivered হয়েছে।</p>

      <div style="border:1px solid #eee;border-radius:10px;padding:14px;margin:12px 0;">
        <h3 style="margin:0 0 8px;">🧾 Invoice</h3>

        <p style="margin:0;">
          <b>Invoice No:</b> ${invoiceNo}<br/>
          <b>Order ID:</b> ${order._id}<br/>
          <b>Status:</b> ${order.status}<br/>
          <b>Payment:</b> ${order.paymentMethod || "COD"}<br/>
          <b>Phone:</b> ${order.phone || ""}<br/>
          <b>Address:</b> ${order.deliveryAddress || ""}
        </p>

        <table style="width:100%;border-collapse:collapse;margin-top:10px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Item</th>
              <th style="text-align:center;padding:8px;border-bottom:1px solid #eee;">Qty</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid #eee;">Price</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid #eee;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsRows || ""}</tbody>
        </table>

        <div style="margin-top:10px;text-align:right;">
          <p style="margin:2px 0;"><b>Subtotal:</b> ${money(order.subtotal)} BDT</p>
          <p style="margin:2px 0;"><b>Delivery Fee:</b> ${money(order.deliveryFee)} BDT</p>
          <p style="margin:6px 0;font-size:16px;"><b>Grand Total:</b> ${money(order.total)} BDT</p>
        </div>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:14px 0;" />

      <p style="margin:0 0 8px;"><b>Receipt:</b></p>
      <p style="margin:0 0 14px;">
        <a href="${receiptUrl}" target="_blank" rel="noreferrer">View / Download Receipt</a>
      </p>

      <p style="margin:0 0 8px;"><b>Tracking:</b></p>
      <p style="margin:0;">
        <a href="${trackUrl}" target="_blank" rel="noreferrer">Track this order</a>
      </p>
    </div>
  `;
}

// POST /api/orders
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items,
      deliveryAddress,
      phone,
      notes,
      paymentMethod,
      deliveryFee,
      scheduledFor,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // Validate scheduled time if provided
    let isScheduled = false;
    let scheduledDate = null;

    if (scheduledFor) {
      scheduledDate = new Date(scheduledFor);
      const now = new Date();

      if (isNaN(scheduledDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid scheduled date format" });
      }

      if (scheduledDate <= now) {
        return res
          .status(400)
          .json({ message: "Scheduled time must be in the future" });
      }

      // Optional: Limit how far in advance (e.g., max 7 days)
      const maxDays = 7;
      const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);
      if (scheduledDate > maxDate) {
        return res.status(400).json({
          message: `Cannot schedule more than ${maxDays} days in advance`,
        });
      }

      isScheduled = true;
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } }).lean();
    const map = new Map(menuItems.map((m) => [String(m._id), m]));

    const normalizedItems = [];
    let subtotal = 0;

    for (const i of items) {
      const m = map.get(String(i.menuItemId));
      if (!m)
        return res.status(400).json({ message: "Invalid menuItemId in items" });
      if (m.isAvailable === false)
        return res.status(400).json({ message: `${m.name} is not available` });

      const qty = Math.max(1, Number(i.qty || 1));
      const price = Number(m.price || 0);

      normalizedItems.push({
        menuItemId: m._id,
        name: m.name,
        imageUrl: m.imageUrl || "",
        price,
        qty,
      });

      subtotal += price * qty;
    }

    const df = Number(deliveryFee || 0);
    const total = subtotal + df;

    const order = await Order.create({
      userId,
      items: normalizedItems,
      subtotal,
      deliveryFee: df,
      total,
      paymentMethod: paymentMethod || "COD",
      deliveryAddress: deliveryAddress ? String(deliveryAddress).trim() : "",
      phone: phone ? String(phone).trim() : "",
      notes: notes ? String(notes).trim() : "",
      scheduledFor: scheduledDate,
      isScheduled,
      status: isScheduled ? "Scheduled" : "Placed",
      statusHistory: [
        { status: isScheduled ? "Scheduled" : "Placed", at: new Date() },
      ],
    });

    // ✅ Activity: ORDER_PLACED
    await logActivity({
      userId,
      action: isScheduled ? "ORDER_SCHEDULED" : "ORDER_PLACED",
      meta: {
        orderId: String(order._id),
        total: order.total,
        paymentMethod: order.paymentMethod,
        scheduledFor: scheduledDate ? scheduledDate.toISOString() : null,
      },
      req,
    });

    // 🔔 Send notification
    try {
      await notificationService.sendOrderNotification(
        userId,
        {
          _id: order._id,
          orderNumber: order._id,
          total: order.total,
          items: order.items,
        },
        "placed",
      );
    } catch (notifError) {
      console.error("Failed to send order notification:", notifError);
      // Don't fail the order if notification fails
    }

    // email: placed
    try {
      const user = await User.findById(userId).lean();
      if (user?.email) {
        const trackUrl = `${process.env.FRONTEND_URL}/order_tracking?orderId=${order._id}`;
        const scheduledInfo = isScheduled
          ? `<p><b>Scheduled For:</b> ${scheduledDate.toLocaleString()}</p>`
          : "";

        await sendMail({
          to: user.email,
          subject: `Order ${isScheduled ? "Scheduled" : "Placed"} - ${order._id}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2>Order ${isScheduled ? "Scheduled" : "Placed"} ✅</h2>
              <p>Your order has been ${isScheduled ? "scheduled" : "placed"} successfully.</p>
              <p><b>Order ID:</b> ${order._id}</p>
              <p><b>Status:</b> ${order.status}</p>
              ${scheduledInfo}
              <p><b>Total:</b> ${money(order.total)} BDT</p>
              <hr/>
              <p><a href="${trackUrl}" target="_blank" rel="noreferrer">Track your order</a></p>
            </div>
          `,
        });
      }
    } catch (e) {
      console.log("Email send failed (placeOrder):", e.message);
    }

    return res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    console.error("placeOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("myOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const me = req.user;
    const isOwner = String(order.userId) === String(me.id);
    const isStaffOrAdmin = me.role === "staff" || me.role === "admin";
    if (!isOwner && !isStaffOrAdmin)
      return res.status(403).json({ message: "Forbidden" });

    return res.json(order);
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("getAllOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const { status } = req.body;
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const oldStatus = order.status;
    order.status = status;
    order.statusHistory.push({ status, at: new Date() });
    await order.save();

    // ✅ Activity: ORDER_STATUS_CHANGED (log to the order owner)
    await logActivity({
      userId: order.userId,
      action: "ORDER_STATUS_CHANGED",
      meta: {
        orderId: String(order._id),
        from: oldStatus,
        to: status,
        changedByRole: req.user?.role,
        changedById: req.user?.id,
      },
      req,
    });

    // 🔔 Send notification for status change
    try {
      const statusMap = {
        Processing: "preparing",
        Ready: "ready",
        Delivered: "delivered",
        Cancelled: "cancelled",
      };

      const notifStatus = statusMap[status] || status.toLowerCase();

      await notificationService.sendOrderNotification(
        order.userId,
        {
          _id: order._id,
          orderNumber: order._id,
          total: order.total,
          items: order.items,
        },
        notifStatus,
      );
    } catch (notifError) {
      console.error("Failed to send status notification:", notifError);
    }

    // email: status update (delivered -> invoice+receipt)
    try {
      const user = await User.findById(order.userId).lean();
      if (user?.email) {
        const trackUrl = `${process.env.FRONTEND_URL}/order_tracking?orderId=${order._id}`;

        if (status === "Delivered") {
          const receiptUrl = `${process.env.FRONTEND_URL}/receipt?orderId=${order._id}`;

          await sendMail({
            to: user.email,
            subject: `Order Delivered + Receipt - ${order._id}`,
            html: buildDeliveredInvoiceEmail({
              order,
              user,
              trackUrl,
              receiptUrl,
            }),
          });
        } else {
          const timeline = (order.statusHistory || [])
            .slice(-4)
            .map(
              (s) =>
                `<li><b>${s.status}</b> - ${new Date(s.at).toLocaleString()}</li>`,
            )
            .join("");

          await sendMail({
            to: user.email,
            subject: `Order Status Updated - ${order._id}`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h2>Status Updated 🔔</h2>
                <p><b>Order ID:</b> ${order._id}</p>
                <p><b>New Status:</b> ${order.status}</p>
                <h3>Recent Updates</h3>
                <ul>${timeline}</ul>
                <hr/>
                <p><a href="${trackUrl}" target="_blank" rel="noreferrer">Track this order</a></p>
              </div>
            `,
          });
        }
      }
    } catch (e) {
      console.log("Email send failed (updateStatus):", e.message);
    }

    return res.json({ message: "Status updated", order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const me = req.user;
    const isOwner = String(order.userId) === String(me.id);
    const isStaffOrAdmin = me.role === "staff" || me.role === "admin";
    if (!isOwner && !isStaffOrAdmin)
      return res.status(403).json({ message: "Forbidden" });

    // Allow receipts for completed/delivered orders and orders in progress
    const allowedStatuses = ["Delivered", "Ready", "Processing"];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({
        message:
          "Receipt available only for orders that are Processing, Ready, or Delivered",
      });
    }

    return res.json({
      invoiceNo: makeInvoiceNo(order._id),
      orderId: order._id,
      issuedAt: new Date(),
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      phone: order.phone,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      status: order.status,
    });
  } catch (err) {
    console.error("getReceipt error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/orders/:id - Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check ownership
    const isOwner = String(order.userId) === String(req.user.id);
    const isStaffOrAdmin =
      req.user.role === "staff" || req.user.role === "admin";

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if order can be cancelled
    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    if (order.status === "Delivered" || order.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot cancel delivered/completed order" });
    }

    // Check time limit (5 minutes for customers, unlimited for staff/admin)
    if (!isStaffOrAdmin) {
      const orderTime = new Date(order.createdAt).getTime();
      const now = Date.now();
      const diffMinutes = (now - orderTime) / 1000 / 60;

      if (diffMinutes > 5) {
        return res.status(400).json({
          message: "Order can only be cancelled within 5 minutes of placement",
        });
      }
    }

    // Cancel the order
    const oldStatus = order.status;
    order.status = "Cancelled";
    order.statusHistory.push({ status: "Cancelled", at: new Date() });
    await order.save();

    // Log activity
    await logActivity({
      userId: order.userId,
      action: "ORDER_CANCELLED",
      meta: {
        orderId: String(order._id),
        previousStatus: oldStatus,
        cancelledBy: req.user.role,
      },
      req,
    });

    // 🔔 Send cancellation notification
    try {
      await notificationService.sendOrderNotification(
        order.userId,
        {
          _id: order._id,
          orderNumber: order._id,
          total: order.total,
          items: order.items,
        },
        "cancelled",
      );
    } catch (notifError) {
      console.error("Failed to send cancellation notification:", notifError);
    }

    // Send cancellation email
    try {
      const user = await User.findById(order.userId).lean();
      if (user?.email) {
        await sendMail({
          to: user.email,
          subject: `Order Cancelled - ${order._id}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2 style="color: #dc2626;">Order Cancelled</h2>
              <p>Your order has been cancelled.</p>
              <p><b>Order ID:</b> ${order._id}</p>
              <p><b>Total:</b> ${money(order.total)} BDT</p>
              <p>If you have any questions, please contact our support.</p>
            </div>
          `,
        });
      }
    } catch (e) {
      console.log("Cancellation email failed:", e.message);
    }

    return res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("cancelOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ==================== ORDER MODIFICATION ====================

// PUT /api/orders/:id/modify - Modify order (within time limit)
exports.modifyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { items, deliveryAddress, phone, notes } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check ownership
    if (order.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this order" });
    }

    // Check if order can be modified (within 5 minutes and status is "Placed")
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (orderAge > FIVE_MINUTES) {
      return res.status(400).json({
        message: "Order can only be modified within 5 minutes of placement",
        canModify: false,
        timeElapsed: Math.floor(orderAge / 1000 / 60) + " minutes",
      });
    }

    if (order.status !== "Placed") {
      return res.status(400).json({
        message: `Order cannot be modified. Current status: ${order.status}`,
        canModify: false,
      });
    }

    // Update items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      // Validate and calculate new totals
      let newSubtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        if (!item.menuItemId || !item.qty || item.qty < 1) {
          return res.status(400).json({ message: "Invalid item data" });
        }

        // Verify menu item exists
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (!menuItem) {
          return res
            .status(400)
            .json({ message: `Menu item ${item.menuItemId} not found` });
        }

        const itemTotal = menuItem.price * item.qty;
        newSubtotal += itemTotal;

        validatedItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          imageUrl: menuItem.imageUrl || "",
          price: menuItem.price,
          qty: item.qty,
        });
      }

      order.items = validatedItems;
      order.subtotal = newSubtotal;
      order.total =
        newSubtotal + order.deliveryFee - order.discount + order.tax;
    }

    // Update delivery info if provided
    if (deliveryAddress) order.deliveryAddress = deliveryAddress;
    if (phone) order.phone = phone;
    if (notes !== undefined) order.notes = notes;

    // Add modification note to status history
    order.statusHistory.push({
      status: "Modified",
      at: new Date(),
    });

    await order.save();

    // Log activity
    await logActivity({
      userId,
      action: "ORDER_MODIFIED",
      details: `Modified order ${order._id}`,
      meta: { orderId: order._id },
      req,
    });

    return res.json({
      message: "Order modified successfully",
      order,
      canModify: true,
    });
  } catch (err) {
    console.error("modifyOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/orders/:id/can-modify - Check if order can be modified
exports.canModifyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check ownership
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check time and status
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const FIVE_MINUTES = 5 * 60 * 1000;
    const timeRemaining = Math.max(0, FIVE_MINUTES - orderAge);

    const canModify = orderAge <= FIVE_MINUTES && order.status === "Placed";

    return res.json({
      canModify,
      status: order.status,
      timeRemaining: Math.floor(timeRemaining / 1000), // seconds
      timeElapsed: Math.floor(orderAge / 1000), // seconds
      reason: !canModify
        ? orderAge > FIVE_MINUTES
          ? "Time limit exceeded (5 minutes)"
          : `Order status is ${order.status}`
        : null,
    });
  } catch (err) {
    console.error("canModifyOrder error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
