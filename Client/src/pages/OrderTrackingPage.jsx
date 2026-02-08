// OrderTrackingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { apiFetch } from "../utils/api";

/**
 * OrderTrackingPage.jsx
 * Route: /order_tracking
 *
 * Fetches real orders from API and displays tracking information
 */

const STEPS = ["Placed", "Processing", "Ready", "Delivered"];
const ALL_STATUSES = [
  "Placed",
  "Processing",
  "Ready",
  "Delivered",
  "Completed",
  "Cancelled",
];

function money(n) {
  const v = Number(n || 0);
  return `TK ${v}`;
}

function calcTotal(items = []) {
  return items.reduce(
    (sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0),
    0,
  );
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

function normalizeItems(items = []) {
  return (items || []).map((it, idx) => ({
    id:
      it.id ||
      it._id ||
      it.menuItemId ||
      `${idx}-${String(it.name || "item").replace(/\s+/g, "-")}`,
    name: it.name || "Item",
    qty: Number(it.qty ?? it.quantity ?? 1),
    price: Number(it.price ?? 0),
    img:
      it.img ||
      it.image ||
      it.imageUrl ||
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=200&auto=format&fit=crop",
  }));
}

function statusColor(status) {
  if (status === "Cancelled") return "bg-red-600";
  if (status === "Completed") return "bg-green-600";
  if (status === "Delivered") return "bg-emerald-600";
  return "bg-orange-500";
}

function canCancel(order) {
  // Cancel allowed within 5 minutes of createdAt
  const t = order?.createdAt;
  if (!t) return false;

  const now = Date.now();
  const placed = new Date(t).getTime();
  if (Number.isNaN(placed)) return false;

  const diffMinutes = (now - placed) / 1000 / 60;
  const st = order?.status;
  return (
    diffMinutes < 5 &&
    st !== "Cancelled" &&
    st !== "Delivered" &&
    st !== "Completed"
  );
}

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [me, setMe] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load session + orders
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("roms_current_user") || "null");
    if (!u) {
      navigate("/login", { replace: true });
      return;
    }
    setMe(u);
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/api/orders/my");

      const normalized = (data || []).map((o) => ({
        id: o._id,
        userEmail: o.userEmail,
        items: normalizeItems(o.items || []),
        total: o.total ?? calcTotal(o.items || []),
        customerName: o.customerName || "Customer",
        phone: o.phone || "—",
        address: o.deliveryAddress || "—",
        status: o.status,
        createdAt: o.createdAt,
        notes: o.notes || "",
      }));

      setOrders(normalized);

      // Auto-select order from URL or latest active
      const orderIdFromUrl = searchParams.get("orderId");
      if (orderIdFromUrl) {
        setSelectedId(orderIdFromUrl);
      } else {
        const active = normalized.find(
          (o) => o.status !== "Completed" && o.status !== "Cancelled",
        );
        setSelectedId(active?.id || normalized[0]?.id || "");
      }
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const myOrders = useMemo(() => {
    return orders.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }, [orders]);

  const activeOrders = useMemo(() => {
    return myOrders.filter(
      (o) => o.status !== "Completed" && o.status !== "Cancelled",
    );
  }, [myOrders]);

  const selectedOrder = useMemo(() => {
    return myOrders.find((o) => o.id === selectedId) || null;
  }, [myOrders, selectedId]);

  const stepIndex = useMemo(() => {
    const st = selectedOrder?.status || "";
    const idx = STEPS.indexOf(st);
    if (idx >= 0) return idx;
    // Delivered/Completed treat as last step in STEPS
    if (st === "Completed") return STEPS.length - 1;
    if (st === "Cancelled") return -1;
    return 0;
  }, [selectedOrder]);

  const totalPrice = useMemo(() => {
    if (!selectedOrder) return 0;
    return selectedOrder.total ?? calcTotal(selectedOrder.items || []);
  }, [selectedOrder]);

  const cancelOrder = async () => {
    if (!selectedOrder) return;
    if (!window.confirm("Are you sure you want to cancel the order?")) return;

    try {
      await apiFetch(`/api/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Cancelled" }),
      });

      // Refresh orders
      await fetchOrders();
    } catch (err) {
      alert("Failed to cancel order: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          </div>
          <div className="text-slate-800 text-2xl font-black mb-2">
            Loading your orders...
          </div>
          <p className="text-slate-600">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-red-200 p-12 max-w-md">
          <div className="text-8xl mb-6">⚠️</div>
          <h3 className="text-2xl font-black text-red-600 mb-4">
            Error Loading Orders
          </h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Top Hero */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 text-white py-12 px-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* glow effects */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-white/20 blur-3xl rounded-full" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 w-96 h-96 bg-white/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl">
                  📦
                </div>
                <div>
                  <p className="text-cyan-100 text-sm font-semibold">
                    FoodBaZZ Tracking
                  </p>
                  <h1 className="text-4xl font-black">Track Your Order</h1>
                </div>
              </div>
              <p className="text-blue-100 text-lg">
                Real-time status updates, timeline tracking, and complete order
                details
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/order_1st"
                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl font-bold transition-all text-center"
              >
                🍕 Order More
              </Link>
              <Link
                to="/profile"
                className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-bold transition-all text-center"
              >
                📊 Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Active orders + Details */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Orders list */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:col-span-1 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-blue-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-blue-600">
                Active Orders
              </h2>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-bold">
                {activeOrders.length}
              </span>
            </div>

            {activeOrders.length === 0 ? (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 text-center py-12 px-6">
                <div className="text-6xl mb-4">📦</div>
                <p className="font-black text-slate-800 text-xl mb-2">
                  No Active Orders
                </p>
                <p className="text-slate-600 mb-6">
                  Place a new order to see live tracking
                </p>
                <Link
                  to="/order_1st"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  🍕 Start Ordering
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-300 ${
                      selectedId === o.id
                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg scale-105"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <p className="font-black text-slate-800 text-sm">
                          Order #{o.id.slice(-8)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${
                          o.status === "Cancelled"
                            ? "from-red-500 to-rose-500"
                            : o.status === "Delivered"
                              ? "from-green-500 to-emerald-500"
                              : o.status === "Ready"
                                ? "from-blue-500 to-cyan-500"
                                : "from-yellow-500 to-orange-500"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>

                    <div className="h-px bg-slate-200 my-2"></div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        {o.items?.[0]?.name}
                        {o.items?.length > 1
                          ? ` +${o.items.length - 1} more`
                          : ""}
                      </p>
                      <p className="text-sm font-black text-blue-600">
                        {money(o.total)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details panel */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-blue-100 p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-blue-600">
                  Order Details
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Status timeline + customer info + items
                </p>
              </div>
              {selectedOrder ? (
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${
                    selectedOrder.status === "Cancelled"
                      ? "from-red-500 to-rose-500"
                      : selectedOrder.status === "Completed"
                        ? "from-green-500 to-emerald-500"
                        : selectedOrder.status === "Delivered"
                          ? "from-purple-500 to-pink-500"
                          : "from-yellow-500 to-orange-500"
                  }`}
                >
                  {selectedOrder.status}
                </span>
              ) : null}
            </div>

            {!selectedOrder ? (
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-8 text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="font-black text-slate-800 text-xl mb-2">
                  No order selected
                </p>
                <p className="text-slate-600">
                  Pick an order from the left panel to view details
                </p>
              </div>
            ) : (
              <>
                {/* Timeline */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 text-white border-2 border-blue-500/20 p-6 relative overflow-hidden">
                  <div className="pointer-events-none absolute -top-14 -right-14 w-60 h-60 bg-blue-500/20 blur-3xl rounded-full" />

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="text-cyan-300 text-xs font-semibold">
                          Order ID
                        </p>
                        <p className="text-2xl font-black">
                          #{selectedOrder.id.slice(-8)}
                        </p>
                        <p className="text-white/70 text-sm mt-1">
                          Placed: {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-white/70 text-xs font-semibold">
                          Total Amount
                        </p>
                        <p className="text-3xl font-black text-cyan-300">
                          {money(totalPrice)}
                        </p>
                      </div>
                    </div>

                    {selectedOrder.status === "Cancelled" ? (
                      <div className="mt-5 rounded-2xl bg-red-500/20 border-2 border-red-500/40 p-5">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">❌</span>
                          <p className="font-black text-red-200 text-lg">
                            This order was cancelled
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-6 grid grid-cols-4 gap-3">
                          {STEPS.map((st) => {
                            const currentIndex = STEPS.indexOf(
                              selectedOrder.status,
                            );
                            const stepIdx = STEPS.indexOf(st);
                            const done =
                              currentIndex >= stepIdx && currentIndex !== -1;
                            const active = currentIndex === stepIdx;

                            return (
                              <div
                                key={st}
                                className={`rounded-xl px-3 py-3 text-center text-sm font-bold border-2 transition-all duration-300 ${
                                  done
                                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 shadow-lg"
                                    : active
                                      ? "bg-white/10 text-white border-white/30 animate-pulse"
                                      : "bg-white/5 text-white/50 border-white/10"
                                }`}
                              >
                                {st}
                              </div>
                            );
                          })}
                        </div>

                        {/* progress bar */}
                        <div className="mt-5 h-3 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-3 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700 shadow-lg"
                            style={{
                              width: `${Math.max(0, (stepIndex / (STEPS.length - 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Customer + Items */}
                <div className="mt-6 grid md:grid-cols-3 gap-6">
                  {/* Customer info */}
                  <div className="md:col-span-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl border-2 border-blue-200 p-6">
                    <h3 className="text-lg font-black text-blue-600 mb-4">
                      Customer Info
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">👤</span>
                        <div>
                          <p className="text-xs text-slate-600">Name</p>
                          <p className="text-sm font-black text-slate-800 mt-1">
                            {selectedOrder.customerName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📞</span>
                        <div>
                          <p className="text-xs text-slate-600">Phone</p>
                          <p className="text-sm font-black text-slate-800 mt-1">
                            {selectedOrder.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📍</span>
                        <div>
                          <p className="text-xs text-slate-600">Address</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">
                            {selectedOrder.address}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t-2 border-blue-200">
                        {selectedOrder.status === "Cancelled" ? (
                          <div className="px-4 py-3 rounded-xl bg-red-500/20 border-2 border-red-500/40 text-center">
                            <span className="font-black text-red-600 text-sm">
                              ❌ Cancelled
                            </span>
                          </div>
                        ) : canCancel(selectedOrder) ? (
                          <>
                            <button
                              onClick={cancelOrder}
                              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              Cancel Order
                            </button>
                            <p className="mt-2 text-center text-xs text-slate-500">
                              Cancel available within 5 minutes
                            </p>
                          </>
                        ) : (
                          <p className="text-center text-sm text-slate-600 font-semibold">
                            Cannot cancel this order
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="md:col-span-2 bg-white rounded-3xl border-2 border-slate-200 p-6 overflow-hidden">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h3 className="text-lg font-black text-slate-800">
                        Ordered Items
                      </h3>
                      <Link
                        to={`/receipt?orderId=${selectedOrder.id || selectedOrder._id || "NO_ID"}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
                        onClick={() =>
                          console.log("Receipt clicked, order:", selectedOrder)
                        }
                      >
                        📄 Receipt
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {selectedOrder.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 hover:shadow-md transition-all"
                        >
                          <img
                            src={it.img}
                            alt={it.name}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200"
                          />
                          <div className="flex-1">
                            <p className="font-black text-slate-800">
                              {it.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              Qty: <span className="font-bold">{it.qty}</span>
                            </p>
                          </div>

                          <p className="font-black text-blue-600 text-lg">
                            {money(it.price * it.qty)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 pt-5 border-t-2 border-slate-200 flex items-center justify-between">
                      <p className="text-sm text-slate-600 font-semibold">
                        Total Items:{" "}
                        <span className="text-slate-800 font-black">
                          {selectedOrder.items.length}
                        </span>
                      </p>
                      <p className="text-2xl font-black text-blue-600">
                        Total: {money(totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Real-time order tracking • Status updates from backend • FoodBaZZ
          </p>
        </div>
      </div>
    </div>
  );
}
