import { useState } from "react";
import useNotifications from "../hooks/useNotifications";
import { showToast } from "../utils/toast";

/**
 * Notification List Component
 * Displays user notifications with real-time updates
 */
export default function NotificationList() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    deleteNotif,
    deleteAllReadNotifs,
    refresh,
  } = useNotifications();

  const [filter, setFilter] = useState("all"); // all, unread, read

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const handleMarkAsRead = async (id) => {
    try {
      await markRead(id);
      showToast("Marked as read", "success");
    } catch (error) {
      showToast("Failed to mark as read", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
      showToast("All notifications marked as read", "success");
    } catch (error) {
      showToast("Failed to mark all as read", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotif(id);
      showToast("Notification deleted", "success");
    } catch (error) {
      showToast("Failed to delete notification", "error");
    }
  };

  const handleDeleteAllRead = async () => {
    if (!window.confirm("Delete all read notifications?")) return;

    try {
      await deleteAllReadNotifs();
      showToast("All read notifications deleted", "success");
    } catch (error) {
      showToast("Failed to delete notifications", "error");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      order: "🛒",
      promo: "🎁",
      recipe: "🍽️",
      security: "🔒",
      system: "ℹ️",
      tracking: "📦",
      popup: "🔔",
    };
    return icons[type] || "🔔";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="notification-list loading">
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-list error">
        <p>Error: {error}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  return (
    <div className="notification-list">
      <div className="notification-header">
        <h2>
          Notifications
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </h2>

        <div className="notification-actions">
          <button onClick={refresh} className="btn-icon" title="Refresh">
            🔄
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn-text">
              Mark all read
            </button>
          )}
          {notifications.some((n) => n.read) && (
            <button onClick={handleDeleteAllRead} className="btn-text">
              Clear read
            </button>
          )}
        </div>
      </div>

      <div className="notification-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </button>
        <button
          className={filter === "unread" ? "active" : ""}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={filter === "read" ? "active" : ""}
          onClick={() => setFilter("read")}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      <div className="notification-items">
        {filteredNotifications.length === 0 ? (
          <div className="notification-empty">
            <p>No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${notification.read ? "read" : "unread"}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-time">
                  {formatDate(notification.createdAt)}
                </div>
              </div>

              <div className="notification-actions-item">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="btn-icon"
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification._id)}
                  className="btn-icon"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
