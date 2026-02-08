// UserDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiFetch } from "../utils/api";

const ORDER_STATUS_FLOW = [
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

function ensureItemIds(orders = []) {
  // items এর ভিতরে id না থাকলে stable-ish id বসিয়ে দিচ্ছে (demo)
  return orders.map((o) => ({
    ...o,
    items: (o.items || []).map((it, idx) => ({
      ...it,
      id:
        it.id ||
        `${o.id}-item-${idx}-${String(it.name || "item").replace(/\s+/g, "-")}`,
    })),
  }));
}

function seedDemoDataIfMissing(currentUser) {
  const demoEmail = currentUser?.email || "demo@foodbazz.com";

  // orders seed
  const existingOrders = localStorage.getItem("roms_orders");
  if (!existingOrders) {
    const demo = [
      {
        id: "ORD-101",
        userEmail: demoEmail,
        items: [
          { id: "m1", name: "Beef Burger", qty: 1, price: 250 },
          { id: "m2", name: "Drink", qty: 2, price: 60 },
        ],
        status: "Processing",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        receiptId: "",
      },
      {
        id: "ORD-099",
        userEmail: demoEmail,
        items: [{ id: "m3", name: "Chicken Fry", qty: 1, price: 300 }],
        status: "Completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        receiptId: "RCPT-099",
      },
      {
        id: "ORD-090",
        userEmail: demoEmail,
        items: [
          { id: "m4", name: "Soup", qty: 2, price: 120 },
          { id: "m5", name: "French Fries", qty: 1, price: 140 },
        ],
        status: "Completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 90).toISOString(),
        receiptId: "RCPT-090",
      },
    ];
    localStorage.setItem("roms_orders", JSON.stringify(demo));
  }

  // reviews seed (optional) — না চাইলে মুছে দাও
  const existingReviews = localStorage.getItem("roms_item_reviews");
  if (!existingReviews) {
    const demo = [
      {
        id: "REV-1",
        userEmail: demoEmail,
        orderId: "ORD-099",
        itemId: "m3",
        itemName: "Chicken Fry",
        rating: 5,
        comment: "Crispy & tasty!",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ];
    localStorage.setItem("roms_item_reviews", JSON.stringify(demo));
  }
}

export default function UserDashboard() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [orders, setOrders] = useState([]);
  const [itemReviews, setItemReviews] = useState([]);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Review modal
  const [reviewModal, setReviewModal] = useState({
    open: false,
    orderId: "",
    item: null,
  });
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("roms_current_user") || "null");
    if (!u) {
      navigate("/login", { replace: true });
      return;
    }
    setMe(u);

    seedDemoDataIfMissing(u);

    const osRaw = JSON.parse(localStorage.getItem("roms_orders") || "[]");
    const os = ensureItemIds(Array.isArray(osRaw) ? osRaw : []);
    localStorage.setItem("roms_orders", JSON.stringify(os));
    setOrders(os);

    const rs = JSON.parse(localStorage.getItem("roms_item_reviews") || "[]");
    setItemReviews(Array.isArray(rs) ? rs : []);
  }, [navigate]);

  const myOrders = useMemo(() => {
    if (!me?.email) return [];
    return orders
      .filter(
        (o) => (o.userEmail || "").toLowerCase() === me.email.toLowerCase(),
      )
      .map((o) => ({
        ...o,
        total: o.total ?? calcTotal(o.items || []),
      }))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, me]);

  const totalOrdered = useMemo(() => myOrders.length, [myOrders]);

  const avgRating = useMemo(() => {
    if (!me?.email) return 0;
    const mine = itemReviews.filter(
      (r) => (r.userEmail || "").toLowerCase() === me.email.toLowerCase(),
    );
    if (!mine.length) return 0;
    const sum = mine.reduce((s, r) => s + Number(r.rating || 0), 0);
    return sum / mine.length;
  }, [itemReviews, me]);

  const activeOrder = useMemo(() => {
    const active = myOrders.find(
      (o) => o.status !== "Completed" && o.status !== "Cancelled",
    );
    return active || null;
  }, [myOrders]);

  const filteredHistory = useMemo(() => {
    const key = q.trim().toLowerCase();
    return myOrders.filter((o) => {
      const matchQ =
        !key ||
        String(o.id || "")
          .toLowerCase()
          .includes(key) ||
        (o.items || []).some((it) =>
          String(it.name || "")
            .toLowerCase()
            .includes(key),
        );
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [myOrders, q, statusFilter]);

  const myReviews = useMemo(() => {
    if (!me?.email) return [];
    return itemReviews
      .filter(
        (r) => (r.userEmail || "").toLowerCase() === me.email.toLowerCase(),
      )
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [itemReviews, me]);

  const isReviewed = (orderId, itemId) => {
    if (!me?.email) return false;
    return itemReviews.some(
      (r) =>
        (r.userEmail || "").toLowerCase() === me.email.toLowerCase() &&
        r.orderId === orderId &&
        r.itemId === itemId,
    );
  };

  const openReview = (order, item) => {
    setNewReview({ rating: 5, comment: "" });
    setReviewModal({ open: true, orderId: order.id, item });
    document.body.style.overflow = "hidden";
  };

  const closeReview = () => {
    setReviewModal({ open: false, orderId: "", item: null });
    document.body.style.overflow = "auto";
  };

  const saveItemReview = () => {
    if (!me?.email || !reviewModal.item) return;

    const rating = Number(newReview.rating || 0);
    const comment = String(newReview.comment || "").trim();

    if (!(rating >= 1 && rating <= 5)) return alert("Rating 1-5 হতে হবে");
    if (!comment) return alert("Comment লিখো");

    if (isReviewed(reviewModal.orderId, reviewModal.item.id)) {
      return alert("এই item এর review already দেয়া আছে");
    }

    const payload = {
      id: `REV-${Date.now()}`,
      userEmail: me.email,
      orderId: reviewModal.orderId,
      itemId: reviewModal.item.id,
      itemName: reviewModal.item.name,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    const all = JSON.parse(localStorage.getItem("roms_item_reviews") || "[]");
    const list = Array.isArray(all) ? all : [];
    const next = [payload, ...list];

    localStorage.setItem("roms_item_reviews", JSON.stringify(next));
    setItemReviews(next);

    closeReview();
  };

  const deleteReview = (reviewId) => {
    if (!confirm("Delete this review?")) return;
    const next = itemReviews.filter((r) => r.id !== reviewId);
    localStorage.setItem("roms_item_reviews", JSON.stringify(next));
    setItemReviews(next);
  };

  const logout = () => {
    localStorage.removeItem("roms_current_user");
    navigate("/login");
  };

  const gotoReceipt = (order) => {
    navigate(`/receipt?orderId=${order.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl bg-black text-white p-6 md:p-7 border border-orange-500/30 shadow-xl relative overflow-hidden"
        >
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-orange-500/20 blur-3xl rounded-full" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 w-96 h-96 bg-white/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-orange-300 text-sm font-semibold">
                User Dashboard
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                Welcome, {me?.fullName || "FoodLover"} 🍽️
              </h1>
              <p className="text-white/80 mt-2">
                Profile summary, active order, history, and item reviews — all
                in one place.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <Link
                to="/order_1st"
                className="px-4 py-2 rounded-full border border-orange-500 text-orange-200 hover:bg-orange-500 hover:text-white transition font-semibold"
              >
                Order Now
              </Link>
              <Link
                to="/manage"
                className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 transition font-extrabold"
              >
                Edit Profile
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition font-bold"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
        </motion.div>

        {/* Profile Summary + Active Order */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Profile summary */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:col-span-1 rounded-3xl border border-orange-200 bg-white shadow p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-extrabold text-xl">
                {(me?.fullName || "U").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-xl font-extrabold text-black">
                  {me?.fullName || "User"}
                </p>
                <p className="text-sm text-gray-600">{me?.email || "—"}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4">
                <p className="text-xs text-gray-600">Address</p>
                <p className="text-sm font-bold text-black mt-1">
                  {me?.address || "Not set (update in Manage Profile)"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-orange-200 p-4">
                  <p className="text-xs text-gray-600">Total Orders</p>
                  <p className="text-2xl font-extrabold text-orange-600 mt-1">
                    {totalOrdered}
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-200 p-4">
                  <p className="text-xs text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-extrabold text-black mt-1">
                    {avgRating ? avgRating.toFixed(1) : "—"}
                    <span className="text-sm font-bold text-orange-600 ml-1">
                      ★
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs text-gray-600">My Reviews</p>
                <p className="text-sm font-extrabold text-black mt-1">
                  {myReviews.length} item(s)
                </p>
              </div>
            </div>

            <div className="h-1 mt-5 rounded-full bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-80" />
          </motion.div>

          {/* Active order */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="lg:col-span-2 rounded-3xl border border-orange-200 bg-white shadow p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-orange-600">
                  Active Order
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Your latest ongoing order status.
                </p>
              </div>

              <Link
                to="/order_tracking"
                className="px-4 py-2 rounded-full bg-black text-white font-extrabold hover:bg-orange-500 transition"
              >
                Track Order
              </Link>
            </div>

            {!activeOrder ? (
              <div className="mt-5 rounded-2xl bg-orange-50 border border-orange-200 p-6">
                <p className="font-bold text-black">
                  No active orders right now.
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Place a new order to see live status updates here.
                </p>
                <Link
                  to="/order_1st"
                  className="inline-block mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white font-extrabold hover:bg-orange-600 transition"
                >
                  Start Ordering
                </Link>
              </div>
            ) : (
              <div className="mt-5">
                <div className="rounded-2xl bg-black text-white p-5 border border-orange-500/25 relative overflow-hidden">
                  <div className="pointer-events-none absolute -top-14 -right-14 w-56 h-56 bg-orange-500/20 blur-3xl rounded-full" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-orange-300 text-xs font-semibold">
                        Order ID
                      </p>
                      <p className="text-2xl font-extrabold">
                        {activeOrder.id}
                      </p>
                      <p className="text-white/70 text-sm mt-1">
                        {formatDate(activeOrder.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-400/40 bg-white/10">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="font-bold">{activeOrder.status}</span>
                      </span>
                      <p className="text-white/80 text-sm font-semibold">
                        Total:{" "}
                        <span className="text-orange-300">
                          {money(activeOrder.total)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* status progress */}
                  <div className="mt-5 grid grid-cols-5 gap-2">
                    {[
                      "Placed",
                      "Processing",
                      "Ready",
                      "Delivered",
                      "Completed",
                    ].map((st) => {
                      const currentIndex = ORDER_STATUS_FLOW.indexOf(
                        activeOrder.status,
                      );
                      const stepIndex = ORDER_STATUS_FLOW.indexOf(st);
                      const done =
                        currentIndex >= stepIndex && currentIndex !== -1;
                      return (
                        <div
                          key={st}
                          className={`rounded-xl px-2 py-2 text-center text-xs font-extrabold border transition ${
                            done
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white/10 text-white/70 border-white/15"
                          }`}
                        >
                          {st}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* items preview */}
                <div className="mt-4 rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm font-extrabold text-black">Items</p>
                  <div className="mt-2 space-y-2">
                    {(activeOrder.items || []).map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-semibold text-black">
                          {it.name} × {it.qty}
                        </span>
                        <span className="font-extrabold text-black">
                          {money(Number(it.qty || 0) * Number(it.price || 0))}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end mt-4">
                    <button
                      onClick={() => gotoReceipt(activeOrder)}
                      className="px-4 py-2 rounded-xl border border-orange-200 bg-white hover:bg-orange-50 font-extrabold text-black transition"
                    >
                      View Receipt (demo)
                    </button>
                    <Link
                      to="/order_tracking"
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold transition"
                    >
                      Open Tracking
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Order History */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="mt-6 rounded-3xl border border-orange-200 bg-white shadow overflow-hidden"
        >
          <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-orange-600">
                Order History
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Completed orders → review each item.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="All">All Status</option>
                {ORDER_STATUS_FLOW.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by order id / item..."
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-72"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-orange-50">
                <tr className="text-left">
                  <th className="px-6 py-3 text-orange-700 font-extrabold">
                    Order
                  </th>
                  <th className="px-6 py-3 text-orange-700 font-extrabold">
                    Date
                  </th>
                  <th className="px-6 py-3 text-orange-700 font-extrabold">
                    Total
                  </th>
                  <th className="px-6 py-3 text-orange-700 font-extrabold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-orange-700 font-extrabold text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-orange-100">
                {filteredHistory.map((o) => (
                  <React.Fragment key={o.id}>
                    <tr className="hover:bg-orange-50/60 transition">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-black">{o.id}</p>
                        <p className="text-xs text-gray-500">
                          {(o.items || [])
                            .slice(0, 2)
                            .map((it) => it.name)
                            .join(", ")}
                          {(o.items || []).length > 2 ? " ..." : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-black">
                        {money(o.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-200 bg-white">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="font-bold text-gray-800">
                            {o.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => gotoReceipt(o)}
                            className="px-3 py-2 rounded-xl bg-black text-white font-extrabold hover:bg-orange-500 transition"
                          >
                            Receipt
                          </button>
                          <Link
                            to="/order_tracking"
                            className="px-3 py-2 rounded-xl border border-orange-200 bg-white hover:bg-orange-50 font-extrabold text-black transition"
                          >
                            Track
                          </Link>
                        </div>
                      </td>
                    </tr>

                    {/* Completed order -> per item review */}
                    {o.status === "Completed" && (
                      <tr>
                        <td colSpan={5} className="px-6 pb-6">
                          <div className="rounded-2xl border border-gray-200 p-4">
                            <p className="text-sm font-extrabold text-black mb-3">
                              Items (Review each)
                            </p>

                            <div className="space-y-2">
                              {(o.items || []).map((it, idx) => {
                                const reviewed = isReviewed(o.id, it.id);
                                return (
                                  <div
                                    key={it.id || idx}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-orange-50 border border-orange-200 p-3"
                                  >
                                    <div>
                                      <p className="font-bold text-black">
                                        {it.name}{" "}
                                        <span className="text-gray-500">
                                          × {it.qty}
                                        </span>
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        Price: TK {Number(it.price || 0)}
                                      </p>
                                    </div>

                                    {reviewed ? (
                                      <span className="px-4 py-2 rounded-full bg-black text-white text-xs font-extrabold">
                                        Reviewed ✅
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => openReview(o, it)}
                                        className="px-4 py-2 rounded-full bg-black text-white font-extrabold hover:bg-orange-500 transition"
                                      >
                                        Give Review
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

                {!filteredHistory.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
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

        {/* My Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-6 rounded-3xl border border-orange-200 bg-white shadow overflow-hidden"
        >
          <div className="px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-orange-600">
                My Item Reviews
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Reviews you submitted for ordered foods.
              </p>
            </div>

            <div className="text-sm font-extrabold text-black">
              Total: <span className="text-orange-600">{myReviews.length}</span>
            </div>
          </div>

          <div className="px-6 pb-6">
            {!myReviews.length ? (
              <div className="rounded-2xl bg-orange-50 border border-orange-200 p-6">
                <p className="font-bold text-black">No reviews yet.</p>
                <p className="text-sm text-gray-700 mt-1">
                  Complete an order, then review each item from Order History.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myReviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <p className="font-extrabold text-black">
                        {r.itemName}{" "}
                        <span className="text-gray-500 text-sm">
                          (Order: {r.orderId})
                        </span>
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(r.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-4 py-2 rounded-full bg-black text-white text-sm font-extrabold">
                        {Number(r.rating || 0)} ★
                      </span>
                      <button
                        onClick={() => deleteReview(r.id)}
                        className="px-4 py-2 rounded-full border border-orange-200 bg-white hover:bg-orange-50 font-extrabold text-black transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-2 bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-90" />
        </motion.div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Demo dashboard uses localStorage • Backend হলে JWT + API দিয়ে secured
          হবে.
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.open && reviewModal.item && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
          onClick={closeReview}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-orange-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-black text-white">
              <p className="text-orange-300 text-sm font-semibold">
                Review Item
              </p>
              <h3 className="text-2xl font-extrabold">
                {reviewModal.item.name}
              </h3>
              <p className="text-xs text-white/70 mt-1">
                Order: {reviewModal.orderId}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold">Rating (1–5)</label>
                <select
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview((p) => ({
                      ...p,
                      rating: Number(e.target.value),
                    }))
                  }
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">Comment</label>
                <textarea
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview((p) => ({ ...p, comment: e.target.value }))
                  }
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Write your honest feedback..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeReview}
                  className="px-5 py-2 rounded-xl border border-gray-200 font-extrabold"
                >
                  Cancel
                </button>
                <button
                  onClick={saveItemReview}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold"
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
