import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { showSuccess, showError } from "../utils/toast";
import { apiFetch } from "../utils/api";

const STATUS_OPTIONS = [
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

function calcTotal(items) {
  return items.reduce((sum, it) => sum + it.qty * it.price, 0);
}

function formatDate(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleString();
  } catch {
    return String(d || "");
  }
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/orders/all");
      setOrders(data || []);
    } catch (error) {
      showError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const placed = orders.filter((o) => o.status === "Placed").length;
    const processing = orders.filter((o) => o.status === "Processing").length;
    const ready = orders.filter((o) => o.status === "Ready").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const totalRevenue = orders
      .filter((o) => o.status === "Delivered" || o.status === "Completed")
      .reduce((sum, o) => sum + calcTotal(o.items || []), 0);
    return { total, placed, processing, ready, delivered, totalRevenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o._id?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "All" || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((p) => ({ ...p, status: newStatus }));
      }

      showSuccess(`Order status updated to ${newStatus}`);
    } catch (error) {
      showError("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <AdminLayout
      title="Order Management"
      subtitle="Track and manage all customer orders"
      icon="📦"
    >
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-black">{stats.total}</div>
          <div className="text-sm font-semibold opacity-90">Total Orders</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-3xl font-black">{stats.placed}</div>
          <div className="text-sm font-semibold opacity-90">New Orders</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-xl">
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
          <div className="text-4xl mb-2">🚚</div>
          <div className="text-3xl font-black">{stats.delivered}</div>
          <div className="text-sm font-semibold opacity-90">Delivered</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-3xl font-black">{stats.totalRevenue}৳</div>
          <div className="text-sm font-semibold opacity-90">Revenue</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Search by order ID, customer, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              onClick={() => setFilterStatus("All")}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                filterStatus === "All"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
            </div>
            <p className="text-slate-600 text-xl font-bold">
              Loading orders...
            </p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-20 text-center">
          <div className="text-8xl mb-6">📦</div>
          <h3 className="text-3xl font-black text-slate-800 mb-4">
            No Orders Found
          </h3>
          <p className="text-slate-600 text-lg">
            {searchTerm
              ? "Try a different search term"
              : "No orders match the selected filter"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 mb-1">
                    #{order._id?.slice(-8)}
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
                    {order.customerName}
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
                  Items ({order.items?.length || 0})
                </p>
                <div className="space-y-1">
                  {(order.items || []).slice(0, 2).map((item, idx) => (
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
                  {(order.items?.length || 0) > 2 && (
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
                  ৳{calcTotal(order.items || [])}
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
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                  disabled={updatingStatus === order._id}
                  className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-bold text-slate-700 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
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
                    #{selectedOrder._id?.slice(-8)}
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
                        {selectedOrder.customerName}
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
                        {selectedOrder.deliveryAddress}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.notes && (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <p className="text-sm text-slate-600">Note</p>
                        <p className="font-bold text-orange-600">
                          {selectedOrder.notes}
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
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
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
                    ৳{calcTotal(selectedOrder.items || [])}
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
                    handleStatusChange(selectedOrder._id, e.target.value);
                    setSelectedOrder((p) => ({ ...p, status: e.target.value }));
                  }}
                  className="w-full px-4 py-4 rounded-xl border-2 border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-bold text-lg"
                >
                  {STATUS_OPTIONS.map((s) => (
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
    </AdminLayout>
  );
}
