import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiFetch } from "../utils/api";

const STATUS = [
  "Placed",
  "Processing",
  "Ready",
  "Delivered",
  "Completed",
  "Cancelled",
];

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

  // Auth
  const [staff, setStaff] = useState(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(null);
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

      if (selected && selected.id === orderId) {
        setSelected((p) => ({ ...p, status: nextStatus }));
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const openDetails = (order) => {
    setSelected(order);
    document.body.style.overflow = "hidden";
  };

  const closeDetails = () => {
    setSelected(null);
    document.body.style.overflow = "auto";
  };

  const logoutStaff = () => {
    localStorage.removeItem("roms_current_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-orange-500 text-xl font-bold">
            Loading orders...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
          <p className="font-bold">Error: {error}</p>
          <button
            onClick={fetchOrders}
            className="mt-2 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl bg-black text-white p-6 border border-orange-500/30 shadow-xl relative overflow-hidden"
      >
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 bg-orange-500/20 blur-3xl rounded-full" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-white/10 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-orange-300 text-sm font-semibold">Staff Panel</p>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Order Queue & Status Control 🍔
            </h1>
            <p className="text-white/80 mt-2">
              Track incoming orders, update statuses, and keep delivery smooth.
            </p>
            <p className="text-xs text-white/60 mt-3">
              Logged as:{" "}
              <span className="text-orange-300 font-bold">
                {staff?.fullName || "Staff"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/order_tracking"
              className="px-4 py-2 rounded-full border border-orange-500 text-orange-200 hover:bg-orange-500 hover:text-white transition font-semibold"
            >
              Go Tracking
            </Link>
            <button
              onClick={logoutStaff}
              className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 transition font-extrabold"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
      >
        {[
          { label: "Placed", value: stats.placed },
          { label: "Processing", value: stats.processing },
          { label: "Ready", value: stats.ready },
          { label: "Completed", value: stats.completed },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-orange-200 bg-white shadow p-4"
          >
            <p className="text-sm text-gray-600">{s.label}</p>
            <p className="text-3xl font-extrabold text-orange-600 mt-1">
              {s.value}
            </p>
            <div className="h-1 mt-3 rounded-full bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-80" />
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12 }}
        className="mt-6 rounded-2xl border border-orange-200 bg-white shadow p-4"
      >
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("All")}
              className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                statusFilter === "All"
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-black border-orange-200 hover:bg-orange-50"
              }`}
            >
              All
            </button>

            {STATUS.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                  statusFilter === st
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-black border-orange-200 hover:bg-orange-50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="w-full md:max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order id / customer / item..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
        className="mt-6 rounded-2xl border border-orange-200 bg-white shadow overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-orange-600">
            Active Orders
          </h2>
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold">{filtered.length}</span> orders
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-orange-50">
              <tr className="text-left">
                <th className="px-5 py-3 text-orange-700 font-bold">Order</th>
                <th className="px-5 py-3 text-orange-700 font-bold">
                  Customer
                </th>
                <th className="px-5 py-3 text-orange-700 font-bold">Total</th>
                <th className="px-5 py-3 text-orange-700 font-bold">Status</th>
                <th className="px-5 py-3 text-orange-700 font-bold text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-orange-100">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-orange-50/60 transition">
                  <td className="px-5 py-4">
                    <p className="font-extrabold text-black">{o.id}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(o.createdAt)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold">{o.customer}</p>
                    <p className="text-xs text-gray-600">{o.phone}</p>
                  </td>
                  <td className="px-5 py-4 font-extrabold text-black">
                    TK {calcTotal(o)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-200 bg-white">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="font-bold text-gray-800">
                        {o.status}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openDetails(o)}
                        className="px-3 py-2 rounded-lg bg-black text-white font-bold hover:bg-orange-500 transition"
                      >
                        Details
                      </button>

                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        {STATUS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="h-2 bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-90" />
      </motion.div>

      {/* Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
          onClick={closeDetails}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-orange-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-black text-white relative">
              <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-orange-300 text-sm font-semibold">
                    Order Details
                  </p>
                  <h3 className="text-2xl font-extrabold">{selected.id}</h3>

                  <p className="text-white/80 text-sm mt-1">
                    {selected.customer} • {selected.phone}
                  </p>
                </div>
                <button
                  onClick={closeDetails}
                  className="text-white/90 hover:text-white text-3xl leading-none font-bold"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-xs text-gray-600">Status</p>
                  <p className="text-lg font-extrabold text-orange-700">
                    {selected.status}
                  </p>
                </div>
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-lg font-extrabold text-black">
                    TK {calcTotal(selected)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm font-bold text-black">Delivery Address</p>
                <p className="text-sm text-gray-700 mt-1">{selected.address}</p>
                {selected.note ? (
                  <p className="text-sm text-orange-700 mt-2">
                    <span className="font-bold">Note:</span> {selected.note}
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm font-bold text-black">Items</p>
                <div className="mt-2 space-y-2">
                  {selected.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-semibold">
                        {it.name} × {it.qty}
                      </span>
                      <span className="font-extrabold text-black">
                        TK {it.qty * it.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">Update Status:</span>
                  <select
                    value={selected.status}
                    onChange={(e) => {
                      updateStatus(selected.id, e.target.value);
                      setSelected((p) => ({ ...p, status: e.target.value }));
                    }}
                    className="px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => closeDetails()}
                  className="px-5 py-2 rounded-xl bg-orange-500 text-white font-extrabold hover:bg-orange-600 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
