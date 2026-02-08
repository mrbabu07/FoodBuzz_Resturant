// Enhanced Notifications Utility with Backend Integration
// File: src/utils/notifications.js

import { apiFetch } from "./api";

const KEY = "roms_notifications_v1";

// notification shape:
// { id, userEmail, type: "tracking"|"popup"|"order"|"promo", text, details, createdAt, read: false }

export function getMe() {
  try {
    return JSON.parse(localStorage.getItem("roms_current_user") || "null");
  } catch {
    return null;
  }
}

export function loadAllNotifications() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function saveAllNotifications(list) {
  localStorage.setItem(KEY, JSON.stringify(list || []));
  window.dispatchEvent(new Event("roms_notifications_changed"));
}

export function getMyNotifications(userEmail) {
  const all = loadAllNotifications();
  const email = (userEmail || "").toLowerCase();
  return all
    .filter((n) => (n.userEmail || "").toLowerCase() === email)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getUnreadCount(userEmail) {
  return getMyNotifications(userEmail).filter((n) => !n.read).length;
}

export function addNotification(n) {
  const all = loadAllNotifications();
  const withId = {
    id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...n,
  };
  all.unshift(withId);
  saveAllNotifications(all);
  return withId;
}

export function markAllRead(userEmail) {
  const all = loadAllNotifications();
  const email = (userEmail || "").toLowerCase();
  const next = all.map((n) =>
    (n.userEmail || "").toLowerCase() === email ? { ...n, read: true } : n,
  );
  saveAllNotifications(next);
}

export function markRead(id, read = true) {
  const all = loadAllNotifications();
  const next = all.map((n) => (n.id === id ? { ...n, read } : n));
  saveAllNotifications(next);
}

export function deleteNotification(id) {
  const all = loadAllNotifications();
  const next = all.filter((n) => n.id !== id);
  saveAllNotifications(next);
}

// Backend Integration Functions

/**
 * Get notification preferences from backend
 */
export async function getNotificationPreferences() {
  try {
    const response = await apiFetch("/api/users/me/notifications");
    return response;
  } catch (error) {
    console.error("Failed to get notification preferences:", error);
    throw error;
  }
}

/**
 * Update notification preferences on backend
 */
export async function updateNotificationPreferences(preferences) {
  try {
    const response = await apiFetch("/api/users/me/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    });
    return response;
  } catch (error) {
    console.error("Failed to update notification preferences:", error);
    throw error;
  }
}

/**
 * Save push subscription to backend
 */
export async function savePushSubscription(subscription) {
  try {
    const response = await apiFetch("/api/users/me/push-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription }),
    });
    return response;
  } catch (error) {
    console.error("Failed to save push subscription:", error);
    throw error;
  }
}

/**
 * Remove push subscription from backend
 */
export async function removePushSubscription() {
  try {
    const response = await apiFetch("/api/users/me/push-subscription", {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    throw error;
  }
}

/**
 * Send test notification
 */
export async function sendTestNotification() {
  try {
    const response = await apiFetch("/api/users/me/test-notification", {
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Failed to send test notification:", error);
    throw error;
  }
}

/**
 * Create notification from backend data
 */
export function createNotificationFromBackend(backendNotification) {
  const me = getMe();
  if (!me?.email) return null;

  return addNotification({
    userEmail: me.email,
    type: backendNotification.type || "popup",
    text: backendNotification.title || "New Notification",
    details: backendNotification.message || backendNotification.body || "",
    data: backendNotification.data || {},
  });
}

/**
 * Sync notifications with backend (future enhancement)
 */
export async function syncNotifications() {
  // This would fetch notifications from backend in a real implementation
  // For now, we'll keep using localStorage
  console.log("Notification sync not implemented yet");
}

// Enhanced notification types
export const NotificationTypes = {
  ORDER_PLACED: "order_placed",
  ORDER_PREPARING: "order_preparing",
  ORDER_READY: "order_ready",
  ORDER_DELIVERED: "order_delivered",
  ORDER_CANCELLED: "order_cancelled",
  PROMO_NEW: "promo_new",
  RECIPE_NEW: "recipe_new",
  SECURITY_ALERT: "security_alert",
  SYSTEM_UPDATE: "system_update",
};

/**
 * Create order notification
 */
export function createOrderNotification(orderData, status) {
  const me = getMe();
  if (!me?.email) return null;

  const statusMessages = {
    [NotificationTypes.ORDER_PLACED]: {
      text: `Order #${orderData.orderNumber} placed successfully! 🎉`,
      details: "Your order has been received and is being prepared.",
    },
    [NotificationTypes.ORDER_PREPARING]: {
      text: `Order #${orderData.orderNumber} is being prepared 👨‍🍳`,
      details: "Our chefs are working on your delicious meal.",
    },
    [NotificationTypes.ORDER_READY]: {
      text: `Order #${orderData.orderNumber} is ready! ✅`,
      details: "Your order is ready for pickup or delivery.",
    },
    [NotificationTypes.ORDER_DELIVERED]: {
      text: `Order #${orderData.orderNumber} delivered! 🚚`,
      details: "Your order has been delivered. Enjoy your meal!",
    },
    [NotificationTypes.ORDER_CANCELLED]: {
      text: `Order #${orderData.orderNumber} cancelled ❌`,
      details: "Your order has been cancelled. Refund will be processed.",
    },
  };

  const message = statusMessages[status] || {
    text: `Order #${orderData.orderNumber} updated`,
    details: "Your order status has been updated.",
  };

  return addNotification({
    userEmail: me.email,
    type: "tracking",
    text: message.text,
    details: message.details,
    data: {
      orderId: orderData._id,
      orderNumber: orderData.orderNumber,
      status,
    },
  });
}

/**
 * Create promo notification
 */
export function createPromoNotification(promoData) {
  const me = getMe();
  if (!me?.email) return null;

  return addNotification({
    userEmail: me.email,
    type: "popup",
    text: `🎁 ${promoData.title}`,
    details: promoData.description,
    data: {
      promoId: promoData._id,
      promoCode: promoData.code,
      discount: promoData.discount,
    },
  });
}

/**
 * Create recipe notification
 */
export function createRecipeNotification(recipeData) {
  const me = getMe();
  if (!me?.email) return null;

  return addNotification({
    userEmail: me.email,
    type: "popup",
    text: `🍽️ New Recipe: ${recipeData.name}`,
    details: "Check out our latest delicious recipe!",
    data: {
      recipeId: recipeData._id,
      recipeName: recipeData.name,
      category: recipeData.category,
    },
  });
}

// demo seed (optional)
export function seedDemoNotificationsIfEmpty(userEmail) {
  const mine = getMyNotifications(userEmail);
  if (mine.length) return;

  addNotification({
    userEmail,
    type: "tracking",
    text: "Your order #ORD-101 is processing!",
    details: "We started preparing your food. Track live status.",
  });

  addNotification({
    userEmail,
    type: "popup",
    text: "Order #ORD-099 completed ✅",
    details: "Thanks! You can view the receipt anytime from dashboard.",
  });

  addNotification({
    userEmail,
    type: "popup",
    text: "🎁 Special Offer: 20% Off!",
    details: "Use code SAVE20 on your next order. Valid until tomorrow!",
  });
}
