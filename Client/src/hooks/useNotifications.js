import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  syncNotifications,
} from "../utils/notifications";

/**
 * Custom hook for managing notifications
 */
export function useNotifications(options = {}) {
  const { autoRefresh = true, refreshInterval = 30000 } = options;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (opts = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await getNotifications({
          page: pagination.page,
          limit: pagination.limit,
          ...opts,
        });

        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
        setPagination(response.pagination || pagination);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  // Mark notification as read
  const markRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
      throw err;
    }
  }, []);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotif = useCallback(
    async (id) => {
      try {
        await deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        // Recalculate unread count
        setUnreadCount((prev) => {
          const deletedNotif = notifications.find((n) => n._id === id);
          return deletedNotif && !deletedNotif.read
            ? Math.max(0, prev - 1)
            : prev;
        });
      } catch (err) {
        console.error("Failed to delete notification:", err);
        throw err;
      }
    },
    [notifications],
  );

  // Delete all read notifications
  const deleteAllReadNotifs = useCallback(async () => {
    try {
      await deleteAllRead();
      setNotifications((prev) => prev.filter((n) => !n.read));
    } catch (err) {
      console.error("Failed to delete all read:", err);
      throw err;
    }
  }, []);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Load more notifications (pagination)
  const loadMore = useCallback(() => {
    if (pagination.page < pagination.pages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.page, pagination.pages]);

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchUnreadCount]);

  // Listen for notification updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener("notifications_updated", handleUpdate);
    return () =>
      window.removeEventListener("notifications_updated", handleUpdate);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    markRead,
    markAllRead,
    deleteNotif,
    deleteAllReadNotifs,
    refresh,
    loadMore,
    fetchNotifications,
  };
}

export default useNotifications;
