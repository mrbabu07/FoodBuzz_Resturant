import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";

const STATUS = [
  "Placed",
  "Processing",
  "Ready",
  "Delivered",
  "Completed",
  "Cancelled",
];

const STATUS_COLORS = {
  Placed: "from-blue-500 to-cyan-500",
  Processing: "from-yellow-500 to-orange-500",
  Ready: "from-green-500 to-emerald-500",
  Delivered: "from-purple-500 to-pink-500",
  Completed: "from-slate-500 to-slate-600",
  Cancelled: "from-red-500 to-rose-500",
};

function calcTotal(order) {
  return order.items.reduce((sum, it) => sum + it.qty * it.price, 0);
}

function formatDate(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d || "");
    return dt.toLocaleString();
  } catch {
    return String(d || "");
  }
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("roms_current_user") || "null");
    if (!u || (u.role !== "staff" && u.role !== "admin")) {
      navigate("/login", { replace: true });
      return;
    }
    setStaff(u);
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/api/orders/all");
      const normalized = (data || []).map((o) => ({
        id: o._id,
        customer: o.customerName || "Customer",
        phone: o.phone || "—",
        address: o.deliveryAddress || "—",
        items: (o.items || []).map((it) => ({
          name: it.name,
          qty: it.qty,
          price: it.price,
        })),
        status: o.status,
        createdAt: o.createdAt,
        note: o.notes || "",
      }));
      setOrders(normalized);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const placed = orders.filter((o) => o.status === "Placed").length;
    const processing = orders.filter((o) => o.status === "Processing").length;
    const ready = orders.filter((o) => o.status === "Ready").length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    return { placed, processing, ready, completed };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.items.some((it) => it.name.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = async (orderId, nextStatus) => {
    try {
      await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((p) => ({ ...p, status: nextStatus }));
      }

      showSuccess(`Order status updated to ${nextStatus}`);
    } catch (err) {
      showError("Failed to update status");
    }
  };

  const logoutStaff = () => {
    localStorage.removeItem("roms_current_user");
    localStorage.removeItem("roms_token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
          </div>
          <p className="text-slate-600 text-xl font-bold">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white py-12 px-8 rounded-3xl shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl">
                  🧑‍🍳
                </div>
                <div>
                  <p className="text-orange-100 text-sm font-semibold">
                    Staff Panel
                  </p>
                  <h1 className="text-4xl font-black">Order Management</h1>
                </div>
              </div>
              <p className="text-orange-100 text-lg">
                Track orders, update statuses, and keep delivery smooth
              </p>
              <p className="text-sm text-orange-200 mt-3">
                Logged in as:{" "}
                <span className="font-bold">
                  {staff?.name || staff?.fullName || "Staff"}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/order_tracking"
                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl font-bold transition-all text-center"
              >
                📍 Order Tracking
              </Link>
              <button
                onClick={logoutStaff}
                className="px-6 py-3 bg-white text-orange-600 hover:bg-orange-50 rounded-2xl font-bold transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-800 font-bold text-lg">Error: {error}</p>
              </div>
              <button
                onClick={fetchOrders}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-black">{stats.placed}</div>
            <div className="text-sm font-semibold opacity-90">New Orders</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
            <div className="text-4xl mb-2">👨‍🍳</div>
            <div className="text-3xl font-black">{stats.processing}</div>
            <div className="text-sm font-semibold opacity-90">Processing</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-black">{stats.ready}</div>
            <div className="text-sm font-semibold opacity-90">Ready</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-3xl font-black">{stats.completed}</div>
            <div className="text-sm font-semibold opacity-90">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-lg"
              />
              <svg
                className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter("All")}
                className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  statusFilter === "All"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              {STATUS.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                    statusFilter === st
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-20 text-center">
            <div className="text-8xl mb-6">📦</div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">
              No Orders Found
            </h3>
            <p className="text-slate-600 text-lg">
              {search
                ? "Try a different search term"
                : "No orders match the selected filter"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r ${STATUS_COLORS[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-bold text-slate-800">
                      {order.customer}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-slate-700">
                      {order.phone}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="mb-4">
                  <p className="text-sm font-bold text-slate-700 mb-2">
                    Items ({order.items.length})
                  </p>
                  <div className="space-y-1">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-600">
                          {item.name} × {item.qty}
                        </span>
                        <span className="font-bold text-slate-800">
                          ৳{item.qty * item.price}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-slate-500">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl">
                  <span className="font-bold text-slate-700">Total</span>
                  <span className="text-2xl font-black text-orange-600">
                    ৳{calcTotal(order)}
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    View Details
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-bold text-slate-700"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-semibold">
                      Order Details
                    </p>
                    <h2 className="text-3xl font-black">
                      #{selectedOrder.id.slice(-8)}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border-2 border-orange-200">
                  <h3 className="text-lg font-black text-slate-800 mb-4">
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👤</span>
                      <div>
                        <p className="text-sm text-slate-600">Name</p>
                        <p className="font-bold text-slate-800">
                          {selectedOrder.customer}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📞</span>
                      <div>
                        <p className="text-sm text-slate-600">Phone</p>
                        <p className="font-bold text-slate-800">
                          {selectedOrder.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <p className="text-sm text-slate-600">Address</p>
                        <p className="font-bold text-slate-800">
                          {selectedOrder.address}
                        </p>
                      </div>
                    </div>
                    {selectedOrder.note && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                          <p className="text-sm text-slate-600">Note</p>
                          <p className="font-bold text-orange-600">
                            {selectedOrder.note}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            Qty: {item.qty} × ৳{item.price}
                          </p>
                        </div>
                        <p className="text-xl font-black text-orange-600">
                          ৳{item.qty * item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-slate-200 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-700">
                      Total Amount
                    </span>
                    <span className="text-3xl font-black text-orange-600">
                      ৳{calcTotal(selectedOrder)}
                    </span>
                  </div>
                </div>

                {/* Update Status */}
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4">
                    Update Order Status
                  </h3>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      updateStatus(selectedOrder.id, e.target.value);
                      setSelectedOrder((p) => ({
                        ...p,
                        status: e.target.value,
                      }));
                    }}
                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-bold text-lg"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
