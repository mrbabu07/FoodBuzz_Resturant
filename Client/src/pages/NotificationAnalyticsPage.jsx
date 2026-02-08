import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showError } from "../utils/toast";

export default function NotificationAnalyticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/notifications/analytics?days=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to load analytics");

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      showError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
            </div>
            <p className="text-lg text-slate-600 font-medium">
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              No Analytics Data
            </h3>
            <p className="text-slate-600">
              Analytics data will appear once you receive notifications
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { summary, byType, byPriority, recentActivity } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-purple-100 text-lg">
                  Last {period} days insights
                </p>
              </div>
            </div>

            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-6 py-3 bg-white/20 backdrop-blur-xl rounded-2xl text-white font-semibold border-2 border-white/30 focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all"
            >
              <option value={7} className="text-slate-800">
                Last 7 Days
              </option>
              <option value={30} className="text-slate-800">
                Last 30 Days
              </option>
              <option value={90} className="text-slate-800">
                Last 90 Days
              </option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Notifications"
            value={summary.total}
            icon="📬"
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Engagement Rate"
            value={`${summary.engagementRate}%`}
            icon="👆"
            gradient="from-green-500 to-emerald-500"
            subtitle={`${summary.clicked} clicked`}
          />
          <StatCard
            title="Read Rate"
            value={`${summary.readRate}%`}
            icon="👁️"
            gradient="from-purple-500 to-pink-500"
            subtitle={`${summary.read} read`}
          />
          <StatCard
            title="Unread"
            value={summary.unread}
            icon="🔔"
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Type */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              Notifications by Type
            </h2>
            <div className="space-y-4">
              {Object.entries(byType).map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-700 capitalize">
                      {type}
                    </span>
                    <span className="font-bold text-slate-800">{count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / summary.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {Object.keys(byType).length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No data available
                </p>
              )}
            </div>
          </div>

          {/* By Priority */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              Notifications by Priority
            </h2>
            <div className="space-y-4">
              {Object.entries(byPriority).map(([priority, count]) => {
                const colors = {
                  low: "from-slate-400 to-slate-500",
                  normal: "from-blue-400 to-blue-500",
                  high: "from-orange-400 to-orange-500",
                  urgent: "from-red-400 to-red-500",
                };
                return (
                  <div key={priority}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-700 capitalize">
                        {priority}
                      </span>
                      <span className="font-bold text-slate-800">{count}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${colors[priority] || colors.normal} h-full rounded-full transition-all duration-500`}
                        style={{
                          width: `${(count / summary.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(byPriority).length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">📈</span>
            Recent Activity (Last 7 Days)
          </h2>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-2 h-64">
                {recentActivity.map((item, index) => {
                  const maxCount = Math.max(
                    ...recentActivity.map((i) => i.count),
                  );
                  const height =
                    maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="text-sm font-bold text-slate-800">
                        {item.count}
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-xl transition-all duration-500 hover:from-purple-600 hover:to-indigo-600"
                        style={{ height: `${height}%`, minHeight: "8px" }}
                      ></div>
                      <div className="text-xs text-slate-600 font-semibold text-center">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-12">
              No recent activity data available
            </p>
          )}
        </div>

        {/* Engagement Insights */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">💡</span>
            Insights & Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.engagementRate < 30 && (
              <InsightCard
                icon="📉"
                title="Low Engagement"
                message="Your engagement rate is below 30%. Consider adjusting notification frequency or content."
                color="bg-orange-500/20"
              />
            )}
            {summary.engagementRate >= 50 && (
              <InsightCard
                icon="🎉"
                title="Great Engagement!"
                message="Your notifications are performing well with over 50% engagement rate."
                color="bg-green-500/20"
              />
            )}
            {summary.unread > 10 && (
              <InsightCard
                icon="📬"
                title="Many Unread"
                message={`You have ${summary.unread} unread notifications. Take a moment to review them.`}
                color="bg-blue-500/20"
              />
            )}
            {summary.dismissed > summary.total * 0.3 && (
              <InsightCard
                icon="🚫"
                title="High Dismissal Rate"
                message="Over 30% of notifications are dismissed. Consider improving relevance."
                color="bg-red-500/20"
              />
            )}
            {Object.keys(byType).length === 0 && (
              <InsightCard
                icon="🌟"
                title="Getting Started"
                message="Start receiving notifications to see detailed analytics and insights."
                color="bg-purple-500/20"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient, subtitle }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-semibold mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, message, color }) {
  return (
    <div
      className={`${color} backdrop-blur-xl rounded-2xl p-6 border border-white/20`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-sm text-white/90">{message}</p>
        </div>
      </div>
    </div>
  );
}
