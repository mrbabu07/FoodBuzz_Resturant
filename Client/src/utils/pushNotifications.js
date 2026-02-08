// Push Notifications Utility with Backend Integration
// File: src/utils/pushNotifications.js

import { savePushSubscription, removePushSubscription } from "./notifications";

/**
 * Check if browser supports push notifications
 */
export const isPushSupported = () => {
  return "serviceWorker" in navigator && "PushManager" in window;
};

/**
 * Check current notification permission status
 */
export const getNotificationPermission = () => {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission; // 'default', 'granted', 'denied'
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    throw new Error("This browser does not support notifications");
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    throw new Error("Notification permission was denied");
  }

  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * Register service worker for push notifications
 */
export const registerServiceWorker = async () => {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported");
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("Service Worker registered:", registration);
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    throw error;
  }
};

/**
 * Get service worker registration
 */
export const getServiceWorkerRegistration = async () => {
  if (!isPushSupported()) {
    return null;
  }

  return await navigator.serviceWorker.ready;
};

/**
 * Subscribe to push notifications and save to backend
 */
export const subscribeToPush = async () => {
  try {
    // Request permission first
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    // Get service worker registration
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      throw new Error("Service worker not registered");
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe to push notifications
      // Note: For production, you need VAPID keys from your backend
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: null, // Add VAPID public key here in production
      });
    }

    // Save subscription to backend
    try {
      await savePushSubscription(subscription);
      console.log("Push subscription saved to backend");
    } catch (error) {
      console.error("Failed to save subscription to backend:", error);
      // Continue anyway - subscription still works locally
    }

    console.log("Subscribed to push notifications:", subscription);
    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    throw error;
  }
};

/**
 * Unsubscribe from push notifications and remove from backend
 */
export const unsubscribeFromPush = async () => {
  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return false;
    }

    // Unsubscribe locally
    const result = await subscription.unsubscribe();

    // Remove from backend
    try {
      await removePushSubscription();
      console.log("Push subscription removed from backend");
    } catch (error) {
      console.error("Failed to remove subscription from backend:", error);
      // Continue anyway - local unsubscription succeeded
    }

    console.log("Unsubscribed from push notifications");
    return result;
  } catch (error) {
    console.error("Failed to unsubscribe from push notifications:", error);
    throw error;
  }
};

/**
 * Check if user is subscribed to push notifications
 */
export const isPushSubscribed = async () => {
  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    return false;
  }
};

/**
 * Show local notification (doesn't require push subscription)
 */
export const showLocalNotification = async (title, options = {}) => {
  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  try {
    const registration = await getServiceWorkerRegistration();
    if (registration) {
      // Show via service worker (better for mobile)
      await registration.showNotification(title, {
        icon: "/favicon.jpg",
        badge: "/favicon.jpg",
        vibrate: [200, 100, 200],
        ...options,
      });
    } else {
      // Fallback to browser notification
      new Notification(title, {
        icon: "/favicon.jpg",
        ...options,
      });
    }
  } catch (error) {
    console.error("Failed to show notification:", error);
  }
};

/**
 * Enhanced notification templates for common scenarios
 */
export const NotificationTemplates = {
  orderPlaced: (orderNumber) => ({
    title: "🎉 Order Placed Successfully!",
    body: `Your order #${orderNumber} has been placed and is being prepared.`,
    tag: "order-placed",
    data: { type: "order", orderNumber, url: "/order_tracking" },
    actions: [
      { action: "view-order", title: "View Order" },
      { action: "track-order", title: "Track Order" },
    ],
    requireInteraction: false,
  }),

  orderPreparing: (orderNumber) => ({
    title: "👨‍🍳 Order Being Prepared",
    body: `Your order #${orderNumber} is now being prepared by our chefs.`,
    tag: "order-preparing",
    data: { type: "order", orderNumber, url: "/order_tracking" },
    actions: [{ action: "view-order", title: "View Order" }],
  }),

  orderReady: (orderNumber) => ({
    title: "✅ Order Ready!",
    body: `Your order #${orderNumber} is ready for pickup/delivery.`,
    tag: "order-ready",
    requireInteraction: true,
    data: { type: "order", orderNumber, url: "/order_tracking" },
    actions: [
      { action: "view-order", title: "View Order" },
      { action: "contact-support", title: "Contact Support" },
    ],
  }),

  orderDelivered: (orderNumber) => ({
    title: "🚚 Order Delivered!",
    body: `Your order #${orderNumber} has been delivered. Enjoy your meal!`,
    tag: "order-delivered",
    data: { type: "order", orderNumber, url: "/order_tracking" },
    actions: [
      { action: "rate-order", title: "Rate Order" },
      { action: "reorder", title: "Order Again" },
    ],
  }),

  orderCancelled: (orderNumber) => ({
    title: "❌ Order Cancelled",
    body: `Your order #${orderNumber} has been cancelled. Refund will be processed.`,
    tag: "order-cancelled",
    data: { type: "order", orderNumber, url: "/order_tracking" },
    requireInteraction: true,
  }),

  newPromotion: (title, description, promoCode) => ({
    title: `🎁 ${title}`,
    body: description,
    tag: "promotion",
    data: { type: "promotion", promoCode, url: "/order_1st" },
    actions: [
      { action: "view-menu", title: "View Menu" },
      { action: "use-promo", title: `Use ${promoCode}` },
    ],
  }),

  newRecipe: (recipeName) => ({
    title: "🍽️ New Recipe Added!",
    body: `Check out our new recipe: ${recipeName}`,
    tag: "new-recipe",
    data: { type: "recipe", recipeName, url: "/recipe_1st" },
    actions: [{ action: "view-recipe", title: "View Recipe" }],
  }),

  securityAlert: (message) => ({
    title: "🔒 Security Alert",
    body: message,
    tag: "security-alert",
    data: { type: "security", url: "/profile" },
    requireInteraction: true,
    actions: [{ action: "review-security", title: "Review Security" }],
  }),

  reminderCart: () => ({
    title: "🛒 Items in Your Cart",
    body: "You have items waiting in your cart. Complete your order now!",
    tag: "cart-reminder",
    data: { type: "cart", url: "/cart" },
    actions: [
      { action: "complete-order", title: "Complete Order" },
      { action: "view-cart", title: "View Cart" },
    ],
  }),

  welcomeBack: (userName) => ({
    title: `👋 Welcome back, ${userName}!`,
    body: "Check out our new menu items and special offers.",
    tag: "welcome-back",
    data: { type: "welcome", url: "/order_1st" },
    actions: [{ action: "view-menu", title: "View Menu" }],
  }),
};

/**
 * Send notification using template
 */
export const sendNotification = async (template) => {
  await showLocalNotification(template.title, {
    body: template.body,
    tag: template.tag,
    data: template.data,
    actions: template.actions,
    requireInteraction: template.requireInteraction,
  });
};

/**
 * Send order notification
 */
export const sendOrderNotification = async (orderData, status) => {
  const templates = {
    placed: NotificationTemplates.orderPlaced,
    preparing: NotificationTemplates.orderPreparing,
    ready: NotificationTemplates.orderReady,
    delivered: NotificationTemplates.orderDelivered,
    cancelled: NotificationTemplates.orderCancelled,
  };

  const template = templates[status];
  if (template) {
    await sendNotification(template(orderData.orderNumber));
  }
};

/**
 * Initialize push notifications with backend integration
 * Call this on app startup
 */
export const initializePushNotifications = async () => {
  if (!isPushSupported()) {
    console.log("Push notifications not supported");
    return false;
  }

  try {
    // Register service worker
    await registerServiceWorker();

    // Check if already subscribed
    const isSubscribed = await isPushSubscribed();

    console.log("Push notifications initialized. Subscribed:", isSubscribed);
    return isSubscribed;
  } catch (error) {
    console.error("Failed to initialize push notifications:", error);
    return false;
  }
};

/**
 * Handle notification click events (for service worker)
 */
export const handleNotificationClick = (event) => {
  const { action, notification } = event;
  const data = notification.data || {};

  // Close notification
  notification.close();

  // Handle different actions
  switch (action) {
    case "view-order":
    case "track-order":
      return "/order_tracking";
    case "view-menu":
      return "/order_1st";
    case "view-recipe":
      return "/recipe_1st";
    case "view-cart":
      return "/cart";
    case "complete-order":
      return "/cart";
    case "rate-order":
      return `/order_tracking?rate=${data.orderNumber}`;
    case "reorder":
      return `/order_1st?reorder=${data.orderNumber}`;
    case "use-promo":
      return `/order_1st?promo=${data.promoCode}`;
    case "review-security":
      return "/profile";
    case "contact-support":
      return "/contact";
    default:
      return data.url || "/";
  }
};

export default {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
  showLocalNotification,
  sendNotification,
  sendOrderNotification,
  NotificationTemplates,
  initializePushNotifications,
  handleNotificationClick,
};
