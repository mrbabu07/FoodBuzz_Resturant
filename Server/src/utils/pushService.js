// Push Notification Service using web-push
// File: src/utils/pushService.js

/**
 * SETUP INSTRUCTIONS:
 *
 * 1. Install web-push:
 *    npm install web-push
 *
 * 2. Generate VAPID keys:
 *    npx web-push generate-vapid-keys
 *
 * 3. Add to .env file:
 *    VAPID_PUBLIC_KEY=your_public_key_here
 *    VAPID_PRIVATE_KEY=your_private_key_here
 *    VAPID_SUBJECT=mailto:your@email.com
 *
 * 4. Update Client/public/sw.js with notification handling
 */

let webpush = null;

// Try to load web-push, but don't fail if not installed
try {
  webpush = require("web-push");
} catch (error) {
  console.warn(
    "⚠️ web-push not installed. Push notifications will be simulated.",
  );
  console.warn("   Run: npm install web-push");
}

/**
 * Initialize web-push with VAPID keys
 */
function initializePushService() {
  if (!webpush) {
    return false;
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@foodbuzz.com";

  if (!publicKey || !privateKey) {
    console.warn(
      "⚠️ VAPID keys not configured. Push notifications will be simulated.",
    );
    console.warn("   Generate keys: npx web-push generate-vapid-keys");
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  console.log("✅ Push notification service initialized");
  return true;
}

/**
 * Send push notification to a user
 */
async function sendPushNotification(subscription, payload) {
  // If web-push not available or not configured, simulate
  if (!webpush || !process.env.VAPID_PUBLIC_KEY) {
    console.log("🔔 [SIMULATED] Push notification:", {
      endpoint: subscription?.endpoint,
      payload: payload,
    });

    return {
      success: true,
      simulated: true,
      message: "Push notification simulated (web-push not configured)",
    };
  }

  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
    );

    console.log("✅ Push notification sent:", payload.title);

    return {
      success: true,
      simulated: false,
      statusCode: result.statusCode,
      body: result.body,
    };
  } catch (error) {
    console.error("❌ Push notification failed:", error.message);

    // Handle expired subscriptions
    if (error.statusCode === 410) {
      return {
        success: false,
        expired: true,
        message: "Subscription expired",
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create notification payload
 */
function createNotificationPayload(notification) {
  const { type, title, message, data = {} } = notification;

  // Icon based on notification type
  const icons = {
    order: "🛒",
    promo: "🎁",
    recipe: "🍽️",
    security: "🔒",
    system: "ℹ️",
  };

  const icon = icons[type] || "🔔";

  return {
    title: `${icon} ${title}`,
    body: message,
    icon: "/favicon.jpg",
    badge: "/favicon.jpg",
    data: {
      ...data,
      url: data.url || "/",
      notificationType: type,
      timestamp: new Date().toISOString(),
    },
    actions: getNotificationActions(type, data),
    requireInteraction: type === "order" || type === "security",
    vibrate: [200, 100, 200],
    tag: `${type}-${data.orderId || data.offerId || Date.now()}`,
  };
}

/**
 * Get notification actions based on type
 */
function getNotificationActions(type, data) {
  switch (type) {
    case "order":
      return [
        { action: "view", title: "View Order" },
        { action: "track", title: "Track" },
      ];
    case "promo":
      return [
        { action: "view", title: "View Offer" },
        { action: "order", title: "Order Now" },
      ];
    case "recipe":
      return [{ action: "view", title: "View Recipe" }];
    case "security":
      return [{ action: "review", title: "Review" }];
    default:
      return [{ action: "view", title: "View" }];
  }
}

/**
 * Get VAPID public key for client
 */
function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || null;
}

module.exports = {
  initializePushService,
  sendPushNotification,
  createNotificationPayload,
  getVapidPublicKey,
};
