import React, { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import AdminFooter from "../components/AdminFooter";
import { Line } from "react-chartjs-2";
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
  Title,
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [navOpen, setNavOpen] = useState(false);
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
      <div className="bg-white w-full relative min-h-screen">
        <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading dashboard...
            </p>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white w-full relative min-h-screen">
        <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="text-center bg-white p-8 rounded-3xl shadow-2xl border-2 border-orange-100 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-xl font-black mb-6">
              Error: {error}
            </p>
            <button
              onClick={fetchDashboardData}
              className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-black hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white w-full relative min-h-screen">
        <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600 text-xl font-medium">No data available</p>
        </div>
        <AdminFooter />
      </div>
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

  const StatCard = ({ icon, label, value, delay }) => (
    <div
      className="bg-white rounded-3xl p-6 flex flex-col items-center shadow-2xl border-2 border-orange-100 hover:shadow-xl hover:scale-105 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-5xl mb-3">{icon}</div>
      <div className="text-xs font-black text-gray-600 mb-2 text-center uppercase tracking-wide">
        {label}
      </div>
      <div className="text-3xl font-black text-orange-600">{value}</div>
    </div>
  );

  return (
    <div className="bg-white w-full relative min-h-screen">
      <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />

      <main className="md:ml-16 px-6 py-8 pt-24 md:pt-8 transition-all duration-300">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-orange-600 mb-3">
              Admin Dashboard 📊
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <section className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard
              icon="👥"
              label="Total Users"
              value={animatedStats.totalUsers || 0}
              delay={0}
            />
            <StatCard
              icon="📋"
              label="Total Orders"
              value={animatedStats.totalOrders || 0}
              delay={100}
            />
            <StatCard
              icon="📅"
              label="Today's Orders"
              value={animatedStats.todayOrders || 0}
              delay={200}
            />
            <StatCard
              icon="✅"
              label="Delivered"
              value={animatedStats.deliveredOrders || 0}
              delay={300}
            />
            <StatCard
              icon="⏳"
              label="Pending"
              value={animatedStats.pendingOrders || 0}
              delay={400}
            />
            <StatCard
              icon="💰"
              label="Total Revenue"
              value={`${salesData?.totalRevenue || 0} ৳`}
              delay={500}
            />
          </div>
        </section>

        {/* Charts Section */}
        <section className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8">
            <h3 className="text-3xl font-black text-orange-600 mb-6 text-center">
              Revenue Analytics 📈
            </h3>
            {salesData?.daily?.length > 0 ? (
              <div className="h-96">
                <Line data={revenueLineData} options={chartOptions} />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 text-lg font-medium">
                  No sales data available
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Stats Summary */}
        <section className="max-w-7xl mx-auto mb-8">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8">
            <h3 className="text-3xl font-black text-orange-600 mb-6 text-center">
              Quick Stats Overview 📋
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <p className="text-sm text-gray-600 font-black mb-2 uppercase tracking-wide">
                  Total Recipes
                </p>
                <p className="text-4xl font-black text-orange-600">
                  {animatedStats.totalRecipes || 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <p className="text-sm text-gray-600 font-black mb-2 uppercase tracking-wide">
                  Total Delivered
                </p>
                <p className="text-4xl font-black text-green-600">
                  {salesData?.totalDelivered || 0}
                </p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <p className="text-sm text-gray-600 font-black mb-2 uppercase tracking-wide">
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
            </div>
          </div>
        </section>
      </main>

      <AdminFooter />
    </div>
  );
}
