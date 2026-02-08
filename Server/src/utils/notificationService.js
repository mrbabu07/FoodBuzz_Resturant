// Notification Service
// File: src/utils/notificationService.js

const User = require("../models/User");
const Notification = require("../models/Notification");
const { logActivity } = require("./activityLogger");
const { sendMail } = require("./mailer");
const {
  orderPlacedTemplate,
  orderStatusTemplate,
  promoTemplate,
  recipeTemplate,
  securityTemplate,
} = require("./emailTemplates");
const {
  sendPushNotification,
  createNotificationPayload,
} = require("./pushService");

/**
 * Notification Service for sending various types of notifications
 */
class NotificationService {
  constructor() {
    this.emailService = null; // Will be initialized with actual email service
    this.smsService = null; // Will be initialized with actual SMS service
    this.pushService = null; // Will be initialized with push service
  }

  /**
   * Send notification to user based on their preferences
   * @param {string} userId - User ID
   * @param {Object} notification - Notification data
   * @param {string} notification.type - Type: 'order', 'promo', 'security', 'recipe'
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification message
   * @param {Object} notification.data - Additional data
   * @param {Object} options - Send options
   */
  async sendNotification(userId, notification, options = {}) {
    try {
      const user = await User.findById(userId).select(
        "name email phone notificationPrefs pushSubscription",
      );

      if (!user) {
        throw new Error("User not found");
      }

      const results = [];
      const {
        type,
        title,
        message,
        data = {},
        priority = "normal",
        expiresAt,
      } = notification;

      // Create notification in database
      const dbNotification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        priority,
        expiresAt,
        read: false,
      });

      results.push({
        type: "database",
        status: "saved",
        notificationId: dbNotification._id,
      });

      // Determine which notifications to send based on type and user preferences
      const shouldSendEmail = this.shouldSendEmail(
        type,
        user.notificationPrefs,
      );
      const shouldSendSMS = this.shouldSendSMS(type, user.notificationPrefs);
      const shouldSendPush = this.shouldSendPush(type, user.notificationPrefs);

      // Send email notification
      if (shouldSendEmail && user.email) {
        try {
          const emailResult = await this.sendEmailNotification(user, {
            type,
            title,
            message,
            data,
          });
          results.push({ type: "email", status: "sent", result: emailResult });
        } catch (error) {
          results.push({
            type: "email",
            status: "failed",
            error: error.message,
          });
        }
      }

      // Send SMS notification
      if (shouldSendSMS && user.phone) {
        try {
          const smsResult = await this.sendSMSNotification(user, {
            type,
            title,
            message,
            data,
          });
          results.push({ type: "sms", status: "sent", result: smsResult });
        } catch (error) {
          results.push({ type: "sms", status: "failed", error: error.message });
        }
      }

      // Send push notification
      if (shouldSendPush && user.pushSubscription) {
        try {
          const pushResult = await this.sendPushNotification(user, {
            type,
            title,
            message,
            data,
          });
          results.push({ type: "push", status: "sent", result: pushResult });
        } catch (error) {
          results.push({
            type: "push",
            status: "failed",
            error: error.message,
          });
        }
      }

      // Log notification activity
      await logActivity({
        userId,
        action: "NOTIFICATION_SENT",
        meta: {
          notificationId: dbNotification._id,
          notificationType: type,
          title,
          channels: results.map((r) => r.type),
          success: results.filter((r) => r.status === "sent").length,
          failed: results.filter((r) => r.status === "failed").length,
        },
      });

      return {
        success: true,
        notificationId: dbNotification._id,
        results,
        summary: {
          sent: results.filter((r) => r.status === "sent").length,
          failed: results.filter((r) => r.status === "failed").length,
        },
      };
    } catch (error) {
      console.error("NotificationService error:", error);
      return {
        success: false,
        error: error.message,
        results: [],
      };
    }
  }

  /**
   * Check if email notification should be sent
   */
  shouldSendEmail(type, prefs) {
    if (!prefs) return false;

    switch (type) {
      case "order":
        return prefs.orderEmails || prefs.statusEmails;
      case "promo":
        return prefs.promoEmails;
      case "security":
        return prefs.statusEmails; // Use statusEmails for security notifications
      case "recipe":
        return prefs.promoEmails; // Use promoEmails for recipe notifications
      default:
        return false;
    }
  }

  /**
   * Check if SMS notification should be sent
   */
  shouldSendSMS(type, prefs) {
    if (!prefs || !prefs.smsNotifications) return false;

    switch (type) {
      case "order":
        return true; // Always send SMS for orders if SMS is enabled
      case "security":
        return true; // Always send SMS for security if SMS is enabled
      case "promo":
      case "recipe":
        return false; // Don't send SMS for promotional content
      default:
        return false;
    }
  }

  /**
   * Check if push notification should be sent
   */
  shouldSendPush(type, prefs) {
    if (!prefs || !prefs.pushNotifications) return false;

    switch (type) {
      case "order":
      case "security":
      case "promo":
      case "recipe":
        return true; // Send push for all types if push is enabled
      default:
        return false;
    }
  }

  /**
   * Send email notification (REAL EMAIL SENDING)
   */
  async sendEmailNotification(user, notification) {
    try {
      let htmlContent = "";
      let subject = notification.title;

      // Generate appropriate email template based on notification type
      switch (notification.type) {
        case "order":
          if (notification.data?.status === "placed") {
            htmlContent = orderPlacedTemplate({
              orderNumber:
                notification.data.orderNumber || notification.data.orderId,
              total: notification.data.total || 0,
              items: notification.data.items || [],
              deliveryAddress: notification.data.deliveryAddress || "",
              phone: notification.data.phone || "",
              _id: notification.data.orderId,
            });
          } else {
            htmlContent = orderStatusTemplate(
              {
                orderNumber:
                  notification.data.orderNumber || notification.data.orderId,
                total: notification.data.total || 0,
                _id: notification.data.orderId,
              },
              notification.data.status || "preparing",
            );
          }
          break;

        case "promo":
          htmlContent = promoTemplate({
            title: notification.title,
            description: notification.message,
            discountType: notification.data.discountType || "percentage",
            discountValue: notification.data.discountValue || 10,
            validUntil: notification.data.validUntil || new Date(),
          });
          break;

        case "recipe":
          htmlContent = recipeTemplate({
            name: notification.data.recipeName || "New Recipe",
            category: notification.data.category || "General",
            description: notification.message,
            imageUrl: notification.data.imageUrl || "",
            _id: notification.data.recipeId,
          });
          break;

        case "security":
          htmlContent = securityTemplate({
            message: notification.message,
            action: notification.data.action || "",
          });
          break;

        default:
          // Generic template for other types
          htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #f97316;">${notification.title}</h2>
              <p style="color: #333; line-height: 1.6;">${notification.message}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                <strong>FoodBuzz</strong> - Delicious Food, Delivered Fast
              </p>
            </div>
          `;
      }

      // Send actual email using nodemailer
      const result = await sendMail({
        to: user.email,
        subject: subject,
        html: htmlContent,
      });

      console.log(`✅ Email sent to ${user.email}: ${subject}`);

      return {
        provider: "smtp",
        recipient: user.email,
        messageId: result.messageId || `email_${Date.now()}`,
        timestamp: new Date().toISOString(),
        success: true,
      };
    } catch (error) {
      console.error(`❌ Email send failed to ${user.email}:`, error.message);

      return {
        provider: "smtp",
        recipient: user.email,
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false,
      };
    }
  }

  /**
   * Send SMS notification (simulated for demo)
   */
  async sendSMSNotification(user, notification) {
    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`📱 SMS notification sent to ${user.phone}:`, {
      to: user.phone,
      message: `${notification.title}: ${notification.message}`,
      type: notification.type,
    });

    return {
      provider: "demo",
      recipient: user.phone,
      messageId: `sms_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send push notification (REAL PUSH NOTIFICATION)
   */
  async sendPushNotification(user, notification) {
    try {
      if (!user.pushSubscription || !user.pushSubscription.endpoint) {
        console.log(`⚠️ No push subscription for user ${user._id}`);
        return {
          provider: "web-push",
          success: false,
          message: "No push subscription",
        };
      }

      // Create notification payload
      const payload = createNotificationPayload(notification);

      // Send push notification
      const result = await sendPushNotification(user.pushSubscription, payload);

      if (result.success) {
        console.log(`✅ Push notification sent to user ${user._id}`);
      } else {
        console.log(
          `⚠️ Push notification failed for user ${user._id}:`,
          result.message,
        );
      }

      return {
        provider: "web-push",
        endpoint: user.pushSubscription.endpoint,
        messageId: `push_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...result,
      };
    } catch (error) {
      console.error(
        `❌ Push notification error for user ${user._id}:`,
        error.message,
      );

      return {
        provider: "web-push",
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Send order status notification
   */
  async sendOrderNotification(userId, orderData, status) {
    const statusMessages = {
      placed: {
        title: "🎉 Order Placed Successfully!",
        message: `Your order #${orderData.orderNumber} has been placed and is being prepared.`,
      },
      preparing: {
        title: "👨‍🍳 Order Being Prepared",
        message: `Your order #${orderData.orderNumber} is now being prepared by our chefs.`,
      },
      ready: {
        title: "✅ Order Ready!",
        message: `Your order #${orderData.orderNumber} is ready for pickup/delivery.`,
      },
      delivered: {
        title: "🚚 Order Delivered!",
        message: `Your order #${orderData.orderNumber} has been delivered. Enjoy your meal!`,
      },
      cancelled: {
        title: "❌ Order Cancelled",
        message: `Your order #${orderData.orderNumber} has been cancelled. Refund will be processed.`,
      },
    };

    const notification = statusMessages[status] || {
      title: "Order Update",
      message: `Your order #${orderData.orderNumber} status has been updated.`,
    };

    return await this.sendNotification(userId, {
      type: "order",
      title: notification.title,
      message: notification.message,
      data: {
        orderId: orderData._id,
        orderNumber: orderData.orderNumber,
        status,
        url: "/order_tracking",
      },
    });
  }

  /**
   * Send promotional notification
   */
  async sendPromoNotification(userId, promoData) {
    return await this.sendNotification(userId, {
      type: "promo",
      title: `🎁 ${promoData.title}`,
      message: promoData.description,
      data: {
        promoId: promoData._id,
        promoCode: promoData.code,
        discount: promoData.discount,
        url: "/order_1st",
      },
    });
  }

  /**
   * Send new recipe notification
   */
  async sendRecipeNotification(userId, recipeData) {
    return await this.sendNotification(userId, {
      type: "recipe",
      title: "🍽️ New Recipe Added!",
      message: `Check out our new recipe: ${recipeData.name}`,
      data: {
        recipeId: recipeData._id,
        recipeName: recipeData.name,
        category: recipeData.category,
        url: `/recipes/${recipeData._id}`,
      },
    });
  }

  /**
   * Send security notification
   */
  async sendSecurityNotification(userId, securityData) {
    return await this.sendNotification(userId, {
      type: "security",
      title: "🔒 Security Alert",
      message: securityData.message,
      data: {
        action: securityData.action,
        timestamp: new Date().toISOString(),
        url: "/profile",
      },
    });
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotification(userIds, notification, options = {}) {
    const results = [];

    for (const userId of userIds) {
      try {
        const result = await this.sendNotification(
          userId,
          notification,
          options,
        );
        results.push({ userId, ...result });
      } catch (error) {
        results.push({
          userId,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      total: userIds.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }
}

// Export singleton instance
const notificationService = new NotificationService();
module.exports = notificationService;
