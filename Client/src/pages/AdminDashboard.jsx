import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { apiFetch } from "../utils/api";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animatedStats, setAnimatedStats] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (stats) {
      animateNumbers();
    }
  }, [stats]);

  const animateNumbers = () => {
    const keys = [
      "totalUsers",
      "totalOrders",
      "todayOrders",
      "deliveredOrders",
      "pendingOrders",
      "totalRecipes",
    ];
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;

    keys.forEach((key) => {
      let current = 0;
      const target = stats[key] || 0;
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedStats((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, stepTime);
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const statsRes = await apiFetch("/api/admin/stats");
      setStats(statsRes);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const from = thirtyDaysAgo.toISOString().split("T")[0];
      const to = new Date().toISOString().split("T")[0];

      const salesRes = await apiFetch(
        `/api/admin/reports/sales?from=${from}&to=${to}`,
      );
      setSalesData(salesRes);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
            </div>
            <p className="text-slate-600 text-xl font-bold">
              Loading dashboard...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border-2 border-red-200 max-w-md">
            <div className="text-7xl mb-6">⚠️</div>
            <p className="text-red-600 text-2xl font-black mb-6">
              Error: {error}
            </p>
            <button
              onClick={fetchDashboardData}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:shadow-xl hover:scale-105 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-7xl mb-6">📊</div>
            <p className="text-slate-600 text-xl font-bold">
              No data available
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const revenueLineData = {
    labels: (salesData?.daily || []).map((d) => d.date),
    datasets: [
      {
        label: "Revenue (BDT)",
        data: (salesData?.daily || []).map((d) => d.revenue),
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(249, 115, 22)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(249, 115, 22, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const StatCard = ({ icon, label, value, color, delay }) => (
    <div
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 border-orange-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
      </div>
      <div className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-4xl font-black text-slate-800">{value}</div>
    </div>
  );

  return (
    <AdminLayout
      title="Dashboard"
      subtitle={new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
      icon="📊"
    >
      {/* Summary Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            icon="👥"
            label="Total Users"
            value={animatedStats.totalUsers || 0}
            color="from-blue-500 to-cyan-500"
            delay={0}
          />
          <StatCard
            icon="📋"
            label="Total Orders"
            value={animatedStats.totalOrders || 0}
            color="from-purple-500 to-pink-500"
            delay={100}
          />
          <StatCard
            icon="📅"
            label="Today's Orders"
            value={animatedStats.todayOrders || 0}
            color="from-orange-500 to-amber-500"
            delay={200}
          />
          <StatCard
            icon="✅"
            label="Delivered"
            value={animatedStats.deliveredOrders || 0}
            color="from-green-500 to-emerald-500"
            delay={300}
          />
          <StatCard
            icon="⏳"
            label="Pending"
            value={animatedStats.pendingOrders || 0}
            color="from-yellow-500 to-orange-500"
            delay={400}
          />
          <StatCard
            icon="💰"
            label="Total Revenue"
            value={`${salesData?.totalRevenue || 0} ৳`}
            color="from-indigo-500 to-purple-500"
            delay={500}
          />
        </div>
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-8">
          <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">📈</span>
            Revenue Analytics
          </h3>
          {salesData?.daily?.length > 0 ? (
            <div className="h-80">
              <Line data={revenueLineData} options={chartOptions} />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-slate-600 text-lg font-medium">
                No sales data available
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-8">
          <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-bold mb-1 uppercase tracking-wide">
                    Total Recipes
                  </p>
                  <p className="text-4xl font-black text-orange-600">
                    {animatedStats.totalRecipes || 0}
                  </p>
                </div>
                <div className="text-5xl">🍽️</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-bold mb-1 uppercase tracking-wide">
                    Total Delivered
                  </p>
                  <p className="text-4xl font-black text-green-600">
                    {salesData?.totalDelivered || 0}
                  </p>
                </div>
                <div className="text-5xl">🚚</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-bold mb-1 uppercase tracking-wide">
                    Avg Order Value
                  </p>
                  <p className="text-4xl font-black text-blue-600">
                    {salesData?.totalDelivered > 0
                      ? Math.round(
                          salesData.totalRevenue / salesData.totalDelivered,
                        )
                      : 0}{" "}
                    ৳
                  </p>
                </div>
                <div className="text-5xl">💵</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-8 text-white">
          <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <a
              href="/pos"
              className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl transition-all duration-300 group shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  💳
                </div>
                <div>
                  <div className="font-bold text-lg">POS System</div>
                  <div className="text-sm text-blue-100">Fast ordering</div>
                </div>
              </div>
            </a>

            <a
              href="/managemenuadmin"
              className="p-6 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🍔
                </div>
                <div>
                  <div className="font-bold text-lg">Manage Menu</div>
                  <div className="text-sm text-slate-300">
                    Add or edit items
                  </div>
                </div>
              </div>
            </a>

            <a
              href="/manageordersadmin"
              className="p-6 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📦
                </div>
                <div>
                  <div className="font-bold text-lg">View Orders</div>
                  <div className="text-sm text-slate-300">Process orders</div>
                </div>
              </div>
            </a>

            <a
              href="/managerecipesadmin"
              className="p-6 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📖
                </div>
                <div>
                  <div className="font-bold text-lg">Manage Recipes</div>
                  <div className="text-sm text-slate-300">Add new recipes</div>
                </div>
              </div>
            </a>

            <a
              href="/manageoffers"
              className="p-6 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🎁
                </div>
                <div>
                  <div className="font-bold text-lg">Create Offers</div>
                  <div className="text-sm text-slate-300">
                    Promotional deals
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
