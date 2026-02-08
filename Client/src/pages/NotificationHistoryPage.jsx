import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";

export default function NotificationHistoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    read: "",
    priority: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    loadNotifications();
  }, [pagination.page, filters]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.type && { type: filters.type }),
        ...(filters.read && { read: filters.read }),
        ...(filters.priority && { priority: filters.priority }),
      });

      const response = await fetch(
        `http://localhost:5000/api/notifications?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to load notifications");

      const data = await response.json();
      setNotifications(data.notifications);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      showError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to delete notification");

      showSuccess("Notification deleted");
      loadNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      showError("Failed to delete notification");
    }
  };

  const handleDeleteAllRead = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all read notifications? This cannot be undone.",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/notifications`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete notifications");

      const data = await response.json();
      showSuccess(`${data.count} notifications deleted`);
      loadNotifications();
    } catch (error) {
      console.error("Failed to delete notifications:", error);
      showError("Failed to delete notifications");
    }
  };

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Title", "Message", "Priority", "Status"];
    const rows = notifications.map((n) => [
      new Date(n.createdAt).toLocaleString(),
      n.type,
      n.title,
      n.message,
      n.priority,
      n.read ? "Read" : "Unread",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notifications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess("Notifications exported to CSV");
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !n.title.toLowerCase().includes(searchLower) &&
        !n.message.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (
      filters.startDate &&
      new Date(n.createdAt) < new Date(filters.startDate)
    ) {
      return false;
    }
    if (filters.endDate && new Date(n.createdAt) > new Date(filters.endDate)) {
      return false;
    }
    return true;
  });

  const getTypeIcon = (type) => {
    const icons = {
      order: "🛒",
      promo: "🎁",
      recipe: "🍽️",
      security: "🔒",
      system: "⚙️",
      tracking: "📦",
      popup: "💬",
    };
    return icons[type] || "📢";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-slate-100 text-slate-600",
      normal: "bg-blue-100 text-blue-600",
      high: "bg-orange-100 text-orange-600",
      urgent: "bg-red-100 text-red-600",
    };
    return colors[priority] || colors.normal;
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
            </div>
            <p className="text-lg text-slate-600 font-medium">
              Loading notification history...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-white/90 hover:text-white transition-colors group relative z-10"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold">Back</span>
          </button>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">
                  Notification History
                </h1>
                <p className="text-purple-100 text-lg">
                  {pagination.total} total notifications
                </p>
              </div>
            </div>

            <button
              onClick={exportToCSV}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl transition-all duration-300 flex items-center gap-2 font-semibold"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search notifications..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
            />

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
            >
              <option value="">All Types</option>
              <option value="order">Order</option>
              <option value="promo">Promo</option>
              <option value="recipe">Recipe</option>
              <option value="security">Security</option>
              <option value="system">System</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={filters.read}
              onChange={(e) => setFilters({ ...filters, read: e.target.value })}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
            >
              <option value="">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() =>
                setFilters({
                  type: "",
                  read: "",
                  priority: "",
                  search: "",
                  startDate: "",
                  endDate: "",
                })
              }
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-semibold"
            >
              Clear Filters
            </button>

            <button
              onClick={handleDeleteAllRead}
              className="px-4 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-semibold transition-all"
            >
              Delete All Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                No Notifications Found
              </h3>
              <p className="text-slate-600">
                Try adjusting your filters or check back later
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border-2 p-6 hover:shadow-xl transition-all duration-300 ${
                  notification.read
                    ? "border-slate-200"
                    : "border-purple-300 bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(notification.priority)}`}
                      >
                        {notification.priority}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {notification.type}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      {!notification.read && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-600">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page === 1}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Previous
              </button>

              <span className="text-slate-600 font-semibold">
                Page {pagination.page} of {pagination.pages}
              </span>

              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page === pagination.pages}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
