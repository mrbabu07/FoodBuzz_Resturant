// Real Notifications Utility with Database Backend
// File: src/utils/notifications.js

import { apiFetch } from "./api";

// ============================================
// API-BASED NOTIFICATION FUNCTIONS
// ============================================

/**
 * Get all notifications from backend
 */
export async function getNotifications(options = {}) {
  try {
    const { page = 1, limit = 20, type, read, priority } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (type) params.append("type", type);
    if (read !== undefined) params.append("read", read.toString());
    if (priority) params.append("priority", priority);

    const response = await apiFetch(`/api/notifications?${params.toString()}`);
    return response;
  } catch (error) {
    console.error("Failed to get notifications:", error);
    throw error;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  try {
    const response = await apiFetch("/api/notifications/unread-count");
    return response.count || 0;
  } catch (error) {
    console.error("Failed to get unread count:", error);
    return 0;
  }
}

/**
 * Get single notification
 */
export async function getNotification(id) {
  try {
    const response = await apiFetch(`/api/notifications/${id}`);
    return response;
  } catch (error) {
    console.error("Failed to get notification:", error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(id) {
  try {
    const response = await apiFetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
    });
    window.dispatchEvent(new Event("notifications_updated"));
    return response;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  try {
    const response = await apiFetch("/api/notifications/mark-all-read", {
      method: "PATCH",
    });
    window.dispatchEvent(new Event("notifications_updated"));
    return response;
  } catch (error) {
    console.error("Failed to mark all as read:", error);
    throw error;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(id) {
  try {
    const response = await apiFetch(`/api/notifications/${id}`, {
      method: "DELETE",
    });
    window.dispatchEvent(new Event("notifications_updated"));
    return response;
  } catch (error) {
    console.error("Failed to delete notification:", error);
    throw error;
  }
}

/**
 * Delete all read notifications
 */
export async function deleteAllRead() {
  try {
    const response = await apiFetch("/api/notifications", {
      method: "DELETE",
    });
    window.dispatchEvent(new Event("notifications_updated"));
    return response;
  } catch (error) {
    console.error("Failed to delete all read notifications:", error);
    throw error;
  }
}

/**
 * Send test notification
 */
export async function sendTestNotification() {
  try {
    const response = await apiFetch("/api/notifications/test", {
      method: "POST",
    });
    window.dispatchEvent(new Event("notifications_updated"));
    return response;
  } catch (error) {
    console.error("Failed to send test notification:", error);
    throw error;
  }
}

// ============================================
// NOTIFICATION PREFERENCE FUNCTIONS
// ============================================

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
 * Create notification from backend data (for push notifications)
 */
export function createNotificationFromBackend(backendNotification) {
  // This is now handled by the backend - just trigger a refresh
  window.dispatchEvent(new Event("notifications_updated"));
  return backendNotification;
}

/**
 * Sync notifications with backend
 */
export async function syncNotifications() {
  try {
    const response = await getNotifications({ limit: 50 });
    window.dispatchEvent(new Event("notifications_updated"));
    return response;
  } catch (error) {
    console.error("Failed to sync notifications:", error);
    return null;
  }
}

// ============================================
// NOTIFICATION TYPE CONSTANTS
// ============================================

// Enhanced notification types
export const NotificationTypes = {
  ORDER_PLACED: "order",
  ORDER_PREPARING: "order",
  ORDER_READY: "order",
  ORDER_DELIVERED: "order",
  ORDER_CANCELLED: "order",
  PROMO_NEW: "promo",
  RECIPE_NEW: "recipe",
  SECURITY_ALERT: "security",
  SYSTEM_UPDATE: "system",
};

// ============================================
// HELPER FUNCTIONS (DEPRECATED - Use API)
// ============================================

/**
 * @deprecated Use getNotifications() instead
 * Legacy function for backward compatibility
 */
export function getMe() {
  try {
    return JSON.parse(localStorage.getItem("roms_current_user") || "null");
  } catch {
    return null;
  }
}

/**
 * @deprecated Notifications are now stored in database
 * This function is kept for backward compatibility only
 */
export function getMyNotifications() {
  console.warn(
    "getMyNotifications is deprecated. Use getNotifications() API instead.",
  );
  return [];
}

/**
 * @deprecated Use markAsRead() instead
 */
export function markRead(id) {
  console.warn("markRead is deprecated. Use markAsRead() API instead.");
  return markAsRead(id);
}

/**
 * @deprecated Use markAllAsRead() instead
 */
export function markAllRead() {
  console.warn("markAllRead is deprecated. Use markAllAsRead() API instead.");
  return markAllAsRead();
}
