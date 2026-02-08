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
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center animate-scale-in">
          <div className="spinner mx-auto mb-4"></div>
          <div className="text-gray-900 dark:text-white text-xl font-bold">
            Loading your orders...
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center card max-w-md animate-scale-in">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error Loading Orders
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button onClick={fetchOrders} className="btn-primary">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Top Hero */}
      <div className="container-custom pt-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="card bg-gradient-primary text-white relative overflow-hidden"
        >
          {/* glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-white/20 blur-3xl rounded-full" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 w-96 h-96 bg-black/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-yellow-300 text-sm font-semibold mb-2">
                🚀 FoodBaZZ Tracking
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
                Track Your Order Like a Pro
              </h1>
              <p className="text-white/90 text-lg">
                Real-time status updates, timeline tracking, and complete order
                details
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/order_1st"
                className="btn-outline border-white text-white hover:bg-white hover:text-orange-500"
              >
                🍕 Order More
              </Link>
              <Link
                to="/profile"
                className="bg-white text-orange-500 hover:bg-yellow-300 font-bold px-6 py-3 rounded-lg transition-all"
              >
                📊 Dashboard
              </Link>
            </div>
          </div>

          <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-yellow-400 via-white/30 to-yellow-400 opacity-90" />
        </motion.div>
      </div>

      <div className="container-custom py-8">
        {/* Active orders + Details */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Orders list */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:col-span-1 rounded-3xl border border-orange-200 bg-white shadow p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-orange-600">
                Active Orders
              </h2>
              <span className="text-sm font-extrabold text-black">
                {activeOrders.length}
              </span>
            </div>

            {activeOrders.length === 0 ? (
              <div className="mt-5 card bg-orange-50 dark:bg-gray-800 text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                  No Active Orders
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Place a new order to see live tracking
                </p>
                <Link to="/order_1st" className="btn-primary inline-block">
                  🍕 Start Ordering
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {activeOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className={`w-full text-left card transition-all hover-lift ${
                      selectedId === o.id
                        ? "border-2 border-orange-500 bg-orange-50 dark:bg-gray-800"
                        : "hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          Order #{o.id.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          📅 {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`badge text-white ${
                          o.status === "Cancelled"
                            ? "bg-red-600"
                            : o.status === "Delivered"
                              ? "bg-green-600"
                              : o.status === "Ready"
                                ? "bg-blue-600"
                                : "bg-orange-500"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>

                    <div className="divider my-2"></div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {o.items?.[0]?.name}
                        {o.items?.length > 1
                          ? ` +${o.items.length - 1} more`
                          : ""}
                      </p>
                      <p className="text-sm font-bold text-gradient">
                        {money(o.total)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="h-1 mt-6 rounded-full bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-80" />
          </motion.div>

          {/* Details panel */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="lg:col-span-2 rounded-3xl border border-orange-200 bg-white shadow p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-orange-600">
                  Order Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Status timeline + customer info + items
                </p>
              </div>
              {selectedOrder ? (
                <span
                  className={`px-4 py-2 rounded-full text-sm font-extrabold text-white ${statusColor(
                    selectedOrder.status,
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              ) : null}
            </div>

            {!selectedOrder ? (
              <div className="mt-6 rounded-2xl bg-orange-50 border border-orange-200 p-6">
                <p className="font-bold text-black">No order selected.</p>
                <p className="text-sm text-gray-700 mt-1">
                  Pick an order from the left panel.
                </p>
              </div>
            ) : (
              <>
                {/* Timeline */}
                <div className="mt-6 rounded-3xl bg-black text-white border border-orange-500/20 p-5 relative overflow-hidden">
                  <div className="pointer-events-none absolute -top-14 -right-14 w-60 h-60 bg-orange-500/20 blur-3xl rounded-full" />

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-orange-300 text-xs font-semibold">
                          Order ID
                        </p>
                        <p className="text-2xl font-extrabold">
                          {selectedOrder.id}
                        </p>
                        <p className="text-white/70 text-sm mt-1">
                          Placed: {formatDate(selectedOrder.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-white/70 text-xs font-semibold">
                          Total
                        </p>
                        <p className="text-2xl font-extrabold text-orange-300">
                          {money(totalPrice)}
                        </p>
                      </div>
                    </div>

                    {selectedOrder.status === "Cancelled" ? (
                      <div className="mt-5 rounded-2xl bg-red-600/15 border border-red-500/30 p-4">
                        <p className="font-extrabold text-red-200">
                          This order was cancelled.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mt-5 grid grid-cols-4 gap-2">
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
                                className={`rounded-xl px-2 py-2 text-center text-xs font-extrabold border transition ${
                                  done
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : active
                                      ? "bg-white/10 text-white border-white/20"
                                      : "bg-white/5 text-white/60 border-white/10"
                                }`}
                              >
                                {st}
                              </div>
                            );
                          })}
                        </div>

                        {/* progress bar */}
                        <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-2 bg-orange-500 transition-all duration-700"
                            style={{
                              width: `${Math.max(0, (stepIndex / (STEPS.length - 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </>
                    )}

                    <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
                  </div>
                </div>

                {/* Customer + Items */}
                <div className="mt-6 grid md:grid-cols-3 gap-6">
                  {/* Customer info */}
                  <div className="md:col-span-1 rounded-3xl border border-gray-200 p-5">
                    <h3 className="text-lg font-extrabold text-orange-600">
                      Customer Info
                    </h3>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4">
                        <p className="text-xs text-gray-600">Name</p>
                        <p className="text-sm font-extrabold text-black mt-1">
                          {selectedOrder.customerName}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="text-sm font-extrabold text-black mt-1">
                          {selectedOrder.phone}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-200 p-4">
                        <p className="text-xs text-gray-600">Address</p>
                        <p className="text-sm font-bold text-black mt-1">
                          {selectedOrder.address}
                        </p>
                      </div>

                      <div className="pt-2">
                        {selectedOrder.status === "Cancelled" ? (
                          <span className="inline-flex px-4 py-2 rounded-full bg-red-600 text-white font-extrabold text-sm">
                            Cancelled
                          </span>
                        ) : canCancel(selectedOrder) ? (
                          <>
                            <button
                              onClick={cancelOrder}
                              className="w-full px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold transition"
                            >
                              Cancel Order
                            </button>
                            <p className="mt-2 text-center text-xs text-gray-500">
                              Cancel available within 5 minutes of placing the
                              order.
                            </p>
                          </>
                        ) : (
                          <p className="text-center text-sm text-gray-600 font-semibold">
                            You can no longer cancel this order.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="md:col-span-2 rounded-3xl border border-gray-200 p-5 overflow-hidden">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-extrabold text-orange-600">
                        Ordered Items
                      </h3>
                      <Link
                        to={`/receipt?orderId=${selectedOrder.id || selectedOrder._id || "NO_ID"}`}
                        className="px-4 py-2 rounded-full bg-black text-white font-extrabold hover:bg-orange-500 transition"
                        onClick={() =>
                          console.log("Receipt clicked, order:", selectedOrder)
                        }
                      >
                        Receipt
                      </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedOrder.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-3"
                        >
                          <img
                            src={it.img}
                            alt={it.name}
                            className="w-16 h-16 rounded-2xl object-cover border border-orange-200"
                          />
                          <div className="flex-1">
                            <p className="font-extrabold text-black">
                              {it.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: <span className="font-bold">{it.qty}</span>
                            </p>
                          </div>

                          <p className="font-extrabold text-black">
                            {money(it.price * it.qty)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-sm text-gray-600 font-semibold">
                        Items:{" "}
                        <span className="text-black">
                          {selectedOrder.items.length}
                        </span>
                      </p>
                      <p className="text-lg font-extrabold text-orange-700">
                        Total: {money(totalPrice)}
                      </p>
                    </div>

                    <div className="h-1 mt-5 rounded-full bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-80" />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Real-time order tracking • Status updates from backend
        </div>
      </div>
    </div>
  );
}
