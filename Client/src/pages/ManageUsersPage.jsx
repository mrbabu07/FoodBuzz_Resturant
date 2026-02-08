// // path: project/src/pages/ManageUsersPage.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { Navigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { apiFetch } from "../utils/api";
// import { getUser } from "../utils/authStorage";

// import AdminFooter from "../components/AdminFooter";
// import AdminNavbar from "../components/AdminNavbar";

// const modalAnim = {
//   hidden: { opacity: 0, scale: 0.96, y: 10 },
//   show: {
//     opacity: 1,
//     scale: 1,
//     y: 0,
//     transition: { type: "spring", stiffness: 260, damping: 18 },
//   },
//   exit: { opacity: 0, scale: 0.98, y: 10, transition: { duration: 0.15 } },
// };

// function fmt(d) {
//   try {
//     const dt = new Date(d);
//     if (Number.isNaN(dt.getTime())) return String(d || "");
//     return dt.toLocaleString();
//   } catch {
//     return String(d || "");
//   }
// }

// function pill(active) {
//   return active ? "bg-white border-orange-200" : "bg-gray-50 border-gray-200";
// }

// export default function ManageUsersPage() {
//   // ✅ Admin guard
//   const me = getUser();
//   if (!me) return <Navigate to="/login" replace />;
//   if (String(me.role).toLowerCase() !== "admin") return <Navigate to="/" replace />;

//   // ✅ Sidebar hover state
//   const [navOpen, setNavOpen] = useState(true);

//   const [users, setUsers] = useState([]);
//   const [q, setQ] = useState("");
//   const [activeFilter, setActiveFilter] = useState("all"); // all/true/false
//   const [loading, setLoading] = useState(false);

//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState(null);

//   // NOTE: details shape তুমি backend অনুযায়ী set করো
//   // এখানে UI ready; API mismatch থাকলে routes ঠিক করতে হবে
//   const [details, setDetails] = useState({
//     user: null,
//     orders: [],
//     reviews: [],
//     activity: [],
//   });

//   const [tab, setTab] = useState("orders");
//   const [busy, setBusy] = useState(false);

//   const load = async () => {
//     try {
//       setLoading(true);

//       // ✅ your backend returns: { page, limit, total, data }
//       const res = await apiFetch(
//         `/api/admin/users?search=${encodeURIComponent(q)}&active=${activeFilter}`
//       );

//       const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
//       setUsers(list);
//     } catch (e) {
//       alert(e?.message || "Failed to load users");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line
//   }, []);

//   const stats = useMemo(() => {
//     const total = users.length;
//     const active = users.filter((u) => u.isActive !== false).length;

//     // NOTE: counts field backend এ না থাকলে 0 দেখাবে
//     const orders = users.reduce((s, u) => s + (u.ordersCount || 0), 0);
//     const reviews = users.reduce((s, u) => s + (u.reviewsCount || 0), 0);

//     return { total, active, orders, reviews };
//   }, [users]);

//   const openUser = async (u) => {
//     try {
//       setOpen(true);
//       setSelected(u);
//       setTab("orders");
//       setDetails({ user: null, orders: [], reviews: [], activity: [] });

//       // ✅ backend: GET /api/admin/users/:id  -> returns user object
//       const user = await apiFetch(`/api/admin/users/${u._id}`);

//       // ✅ backend: GET /api/admin/users/:id/orders -> returns { userId, total, data }
//       let orders = [];
//       try {
//         const o = await apiFetch(`/api/admin/users/${u._id}/orders`);
//         orders = Array.isArray(o?.data) ? o.data : [];
//       } catch {
//         orders = [];
//       }

//       // reviews/activity যদি backend endpoint না থাকে, empty থাকবে
//       setDetails({
//         user,
//         orders,
//         reviews: [],
//         activity: [],
//       });
//     } catch (e) {
//       alert(e?.message || "Failed to load details");
//     }
//   };

//   const close = () => {
//     setOpen(false);
//     setSelected(null);
//     setDetails({ user: null, orders: [], reviews: [], activity: [] });
//   };

//   const toggleActive = async () => {
//     if (!details?.user?._id) return;

//     try {
//       setBusy(true);

//       const nextActive = !(details.user.isActive !== false);

//       // ✅ your backend route: PATCH /api/admin/users/:id
//       await apiFetch(`/api/admin/users/${details.user._id}`, {
//         method: "PATCH",
//         body: JSON.stringify({ isActive: nextActive }),
//       });

//       await load();

//       const freshUser = await apiFetch(`/api/admin/users/${details.user._id}`);
//       let freshOrders = [];
//       try {
//         const o = await apiFetch(`/api/admin/users/${details.user._id}/orders`);
//         freshOrders = Array.isArray(o?.data) ? o.data : [];
//       } catch {
//         freshOrders = [];
//       }

//       setDetails({
//         user: freshUser,
//         orders: freshOrders,
//         reviews: [],
//         activity: [],
//       });
//     } catch (e) {
//       alert(e?.message || "Update failed");
//     } finally {
//       setBusy(false);
//     }
//   };

//   const deleteUser = async () => {
//     if (!details?.user?._id) return;
//     if (!confirm(`Delete user: ${details.user.email}?`)) return;

//     try {
//       setBusy(true);

//       // ⚠️ backend এ DELETE route তোমার দেওয়া admin.user.routes.js এ নাই
//       // যদি add করো, তাহলে এটা কাজ করবে।
//       await apiFetch(`/api/admin/users/${details.user._id}`, { method: "DELETE" });

//       close();
//       await load();
//     } catch (e) {
//       alert(
//         e?.message ||
//           "Delete failed (backend এ DELETE /api/admin/users/:id route add করতে হবে)"
//       );
//     } finally {
//       setBusy(false);
//     }
//   };

//   // ✅ Admin layout spacing
//   const sidebarPad = navOpen ? "md:pl-64" : "md:pl-20";

//   return (
//     <div className="min-h-screen bg-white">
//       {/* ✅ Admin Sidebar */}
//       <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />

//       <div className={`${sidebarPad} transition-all duration-300`}>
//         <div className="max-w-7xl mx-auto px-4 py-8">
//           {/* Banner */}
//           <motion.div
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.45 }}
//             className="rounded-3xl bg-black text-white p-6 md:p-7 border border-orange-500/30 shadow-xl relative overflow-hidden"
//           >
//             <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-orange-500/20 blur-3xl rounded-full" />
//             <div className="pointer-events-none absolute -bottom-28 -left-28 w-96 h-96 bg-white/10 blur-3xl rounded-full" />

//             <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
//               <div>
//                 <p className="text-orange-300 text-sm font-semibold">Admin Panel</p>
//                 <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
//                   Manage Users 👥
//                 </h1>
//                 <p className="text-white/80 mt-2">
//                   View users & orders. Deactivate or delete when needed.
//                 </p>
//                 <p className="text-xs text-white/60 mt-3">
//                   Logged as:{" "}
//                   <span className="text-orange-300 font-bold">
//                     {me.name || me.fullName || me.email}
//                   </span>
//                 </p>
//               </div>

//               <button
//                 onClick={load}
//                 className="px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 transition font-extrabold"
//               >
//                 {loading ? "Refreshing..." : "Refresh"}
//               </button>
//             </div>

//             <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
//           </motion.div>

//           {/* Stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//             {[
//               { label: "Total Users", value: stats.total },
//               { label: "Active", value: stats.active },
//               { label: "Total Orders", value: stats.orders },
//               { label: "Total Reviews", value: stats.reviews },
//             ].map((s) => (
//               <div
//                 key={s.label}
//                 className="rounded-2xl border border-orange-200 bg-white shadow p-4"
//               >
//                 <p className="text-sm text-gray-600">{s.label}</p>
//                 <p className="text-3xl font-extrabold text-orange-600 mt-1">
//                   {s.value}
//                 </p>
//                 <div className="h-1 mt-3 rounded-full bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-80" />
//               </div>
//             ))}
//           </div>

//           {/* Filters */}
//           <div className="mt-6 rounded-2xl border border-orange-200 bg-white shadow p-4">
//             <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
//               <select
//                 value={activeFilter}
//                 onChange={(e) => setActiveFilter(e.target.value)}
//                 className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
//               >
//                 <option value="all">All Status</option>
//                 <option value="true">Active</option>
//                 <option value="false">Inactive</option>
//               </select>

//               <div className="w-full md:max-w-md flex gap-2">
//                 <input
//                   value={q}
//                   onChange={(e) => setQ(e.target.value)}
//                   placeholder="Search by name / email / phone..."
//                   className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
//                 />
//                 <button
//                   onClick={load}
//                   className="px-5 py-3 rounded-xl bg-black text-white font-extrabold hover:bg-orange-500 transition"
//                 >
//                   Search
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="mt-6 rounded-2xl border border-orange-200 bg-white shadow overflow-hidden">
//             <div className="px-5 py-4 flex items-center justify-between">
//               <h2 className="text-xl font-extrabold text-orange-600">Users</h2>
//               <p className="text-sm text-gray-600">
//                 Showing <span className="font-bold">{users.length}</span>
//               </p>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm">
//                 <thead className="bg-orange-50">
//                   <tr className="text-left">
//                     <th className="px-5 py-3 text-orange-700 font-bold">User</th>
//                     <th className="px-5 py-3 text-orange-700 font-bold">Contact</th>
//                     <th className="px-5 py-3 text-orange-700 font-bold">Status</th>
//                     <th className="px-5 py-3 text-orange-700 font-bold">Counts</th>
//                     <th className="px-5 py-3 text-orange-700 font-bold text-right">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-orange-100">
//                   {users.map((u) => {
//                     const isActive = u.isActive !== false;
//                     return (
//                       <tr key={u._id} className="hover:bg-orange-50/60 transition">
//                         <td className="px-5 py-4">
//                           <p className="font-extrabold text-black">{u.name || "—"}</p>
//                           <p className="text-xs text-gray-500">{fmt(u.createdAt)}</p>
//                         </td>

//                         <td className="px-5 py-4">
//                           <p className="font-semibold text-gray-800">{u.email || "—"}</p>
//                           <p className="text-xs text-gray-600">{u.phone || "—"}</p>
//                         </td>

//                         <td className="px-5 py-4">
//                           <span
//                             className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${pill(
//                               isActive
//                             )}`}
//                           >
//                             <span
//                               className={`w-2 h-2 rounded-full ${
//                                 isActive ? "bg-orange-500" : "bg-gray-400"
//                               }`}
//                             />
//                             <span className="font-bold text-gray-800">
//                               {isActive ? "Active" : "Inactive"}
//                             </span>
//                           </span>
//                         </td>

//                         <td className="px-5 py-4">
//                           <p className="text-xs text-gray-700">
//                             Orders: <b>{u.ordersCount || 0}</b> • Reviews:{" "}
//                             <b>{u.reviewsCount || 0}</b> • Activity:{" "}
//                             <b>{u.activityCount || 0}</b>
//                           </p>
//                         </td>

//                         <td className="px-5 py-4 text-right">
//                           <button
//                             onClick={() => openUser(u)}
//                             className="px-4 py-2 rounded-lg bg-black text-white font-bold hover:bg-orange-500 transition"
//                           >
//                             View
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}

//                   {!users.length && (
//                     <tr>
//                       <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
//                         No users found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="h-2 bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-90" />
//           </div>

//           {/* Modal */}
//           <AnimatePresence>
//             {open && (
//               <div
//                 className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
//                 onClick={close}
//               >
//                 <motion.div
//                   variants={modalAnim}
//                   initial="hidden"
//                   animate="show"
//                   exit="exit"
//                   className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-orange-200 overflow-hidden"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <div className="p-6 bg-black text-white relative">
//                     <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
//                     <div className="flex items-start justify-between gap-4">
//                       <div>
//                         <p className="text-orange-300 text-sm font-semibold">
//                           User Details
//                         </p>
//                         <h3 className="text-2xl font-extrabold">
//                           {details?.user?.name || selected?.name || "—"}
//                         </h3>
//                         <p className="text-white/80 text-sm mt-1">
//                           {details?.user?.email || selected?.email}
//                         </p>
//                         <p className="text-xs text-white/60 mt-2">
//                           Status:{" "}
//                           <span className="text-orange-300 font-bold">
//                             {details?.user?.isActive === false ? "Inactive" : "Active"}
//                           </span>
//                         </p>
//                       </div>

//                       <button
//                         onClick={close}
//                         className="text-white/90 hover:text-white text-3xl leading-none font-bold"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   </div>

//                   {/* Tabs */}
//                   <div className="px-6 pt-5 flex flex-wrap gap-2">
//                     {["orders", "reviews", "activity", "profile"].map((t) => (
//                       <button
//                         key={t}
//                         onClick={() => setTab(t)}
//                         className={`px-4 py-2 rounded-full border font-extrabold transition ${
//                           tab === t
//                             ? "bg-orange-500 text-white border-orange-500"
//                             : "bg-white text-black border-orange-200 hover:bg-orange-50"
//                         }`}
//                       >
//                         {t.toUpperCase()}
//                       </button>
//                     ))}
//                   </div>

//                   <div className="p-6">
//                     {!details?.user ? (
//                       <p className="text-gray-600">Loading details...</p>
//                     ) : (
//                       <>
//                         {tab === "profile" && (
//                           <div className="rounded-2xl border border-orange-200 p-4">
//                             <p className="text-sm">
//                               <b>Name:</b> {details.user.name}
//                             </p>
//                             <p className="text-sm">
//                               <b>Email:</b> {details.user.email}
//                             </p>
//                             <p className="text-sm">
//                               <b>Phone:</b> {details.user.phone || "—"}
//                             </p>
//                             <p className="text-sm">
//                               <b>Address:</b> {details.user.address || "—"}
//                             </p>
//                             <p className="text-sm">
//                               <b>Created:</b> {fmt(details.user.createdAt)}
//                             </p>
//                           </div>
//                         )}

//                         {tab === "orders" && (
//                           <div className="space-y-3">
//                             {(details.orders || []).map((o) => (
//                               <div
//                                 key={o._id}
//                                 className="rounded-2xl border border-orange-200 p-4"
//                               >
//                                 <div className="flex flex-wrap gap-3 justify-between">
//                                   <p className="font-extrabold">Order: {o._id}</p>
//                                   <p className="text-sm text-gray-700">
//                                     <b>Status:</b> {o.status || "—"} •{" "}
//                                     <b>Total:</b> {o.total ?? "—"}
//                                   </p>
//                                 </div>
//                                 <p className="text-xs text-gray-500 mt-1">
//                                   {fmt(o.createdAt)}
//                                 </p>
//                               </div>
//                             ))}
//                             {!details.orders?.length && (
//                               <p className="text-gray-600">No orders found.</p>
//                             )}
//                           </div>
//                         )}

//                         {tab === "reviews" && (
//                           <div className="space-y-3">
//                             {(details.reviews || []).map((r) => (
//                               <div
//                                 key={r._id}
//                                 className="rounded-2xl border border-orange-200 p-4"
//                               >
//                                 <p className="font-extrabold">Rating: {r.rating} ⭐</p>
//                                 <p className="text-sm text-gray-800 mt-1">
//                                   {r.comment || "—"}
//                                 </p>
//                                 <p className="text-xs text-gray-500 mt-2">
//                                   {fmt(r.createdAt)}
//                                 </p>
//                               </div>
//                             ))}
//                             {!details.reviews?.length && (
//                               <p className="text-gray-600">No reviews found.</p>
//                             )}
//                           </div>
//                         )}

//                         {tab === "activity" && (
//                           <div className="space-y-3">
//                             {(details.activity || []).map((a) => (
//                               <div
//                                 key={a._id}
//                                 className="rounded-2xl border border-orange-200 p-4"
//                               >
//                                 <p className="font-extrabold">{a.action}</p>
//                                 <pre className="text-xs bg-orange-50 border border-orange-200 rounded-xl p-3 mt-2 overflow-auto">
// {JSON.stringify(a.meta || {}, null, 2)}
//                                 </pre>
//                                 <p className="text-xs text-gray-500 mt-2">
//                                   {fmt(a.createdAt)}
//                                 </p>
//                               </div>
//                             ))}
//                             {!details.activity?.length && (
//                               <p className="text-gray-600">No activity found.</p>
//                             )}
//                           </div>
//                         )}

//                         <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
//                           <button
//                             disabled={busy}
//                             onClick={toggleActive}
//                             className="px-5 py-3 rounded-xl border border-orange-200 bg-white hover:bg-orange-50 font-extrabold text-black transition disabled:opacity-60"
//                           >
//                             {details.user.isActive === false
//                               ? "Activate User"
//                               : "Deactivate User"}
//                           </button>

//                           <button
//                             disabled={busy}
//                             onClick={deleteUser}
//                             className="px-5 py-3 rounded-xl bg-red-600 text-white font-extrabold hover:bg-red-700 transition disabled:opacity-60"
//                           >
//                             Delete User
//                           </button>
//                         </div>

//                         <p className="text-xs text-gray-500 mt-4">
//                           Note: deactivated users can’t login (if you added isActive check in login).
//                         </p>
//                       </>
//                     )}
//                   </div>
//                 </motion.div>
//               </div>
//             )}
//           </AnimatePresence>

//           {/* ✅ Footer */}
//           <AdminFooter />
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { getUser } from "../utils/authStorage";
import AdminFooter from "../components/AdminFooter";
import AdminNavbar from "../components/AdminNavbar";

function fmt(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d || "");
    return dt.toLocaleString();
  } catch {
    return String(d || "");
  }
}

export default function ManageUsersPage() {
  const me = getUser();
  if (!me) return <Navigate to="/login" replace />;
  if (String(me.role).toLowerCase() !== "admin")
    return <Navigate to="/" replace />;

  const [navOpen, setNavOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState({
    user: null,
    orders: [],
    reviews: [],
    activity: [],
  });
  const [tab, setTab] = useState("orders");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(
        `/api/admin/users?search=${encodeURIComponent(q)}&active=${activeFilter}`,
      );
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
      setUsers(list);
    } catch (e) {
      alert(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive !== false).length;
    const orders = users.reduce((s, u) => s + (u.ordersCount || 0), 0);
    const reviews = users.reduce((s, u) => s + (u.reviewsCount || 0), 0);
    return { total, active, orders, reviews };
  }, [users]);

  const openUser = async (u) => {
    try {
      setOpen(true);
      setSelected(u);
      setTab("orders");
      setDetails({ user: null, orders: [], reviews: [], activity: [] });

      const user = await apiFetch(`/api/admin/users/${u._id}`);
      let orders = [];
      try {
        const o = await apiFetch(`/api/admin/users/${u._id}/orders`);
        orders = Array.isArray(o?.data) ? o.data : [];
      } catch {
        orders = [];
      }

      setDetails({ user, orders, reviews: [], activity: [] });
    } catch (e) {
      alert(e?.message || "Failed to load details");
    }
  };

  const close = () => {
    setOpen(false);
    setSelected(null);
    setDetails({ user: null, orders: [], reviews: [], activity: [] });
  };

  const toggleActive = async () => {
    if (!details?.user?._id) return;

    try {
      setBusy(true);
      const nextActive = !(details.user.isActive !== false);

      await apiFetch(`/api/admin/users/${details.user._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextActive }),
      });

      await load();

      const freshUser = await apiFetch(`/api/admin/users/${details.user._id}`);
      let freshOrders = [];
      try {
        const o = await apiFetch(`/api/admin/users/${details.user._id}/orders`);
        freshOrders = Array.isArray(o?.data) ? o.data : [];
      } catch {
        freshOrders = [];
      }

      setDetails({
        user: freshUser,
        orders: freshOrders,
        reviews: [],
        activity: [],
      });
    } catch (e) {
      alert(e?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async () => {
    if (!details?.user?._id) return;
    if (!confirm(`Delete user: ${details.user.email}?`)) return;

    try {
      setBusy(true);
      await apiFetch(`/api/admin/users/${details.user._id}`, {
        method: "DELETE",
      });
      close();
      await load();
    } catch (e) {
      alert(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const sidebarPad = navOpen ? "md:pl-64" : "md:pl-20";

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      `}</style>

      <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />

      <div className={`${sidebarPad} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-black via-orange-900 to-black text-white p-8 border-2 border-orange-500 shadow-2xl mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <p className="text-orange-300 text-sm font-bold">Admin Panel</p>
                <h1 className="text-5xl font-extrabold leading-tight">
                  Manage Users 👥
                </h1>
                <p className="text-white/80 mt-2">
                  View users & orders. Deactivate or delete when needed.
                </p>
                <p className="text-xs text-white/60 mt-3">
                  Logged as:{" "}
                  <span className="text-orange-300 font-bold">
                    {me.name || me.fullName || me.email}
                  </span>
                </p>
              </div>
              <button
                onClick={load}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? "Refreshing..." : "🔄 Refresh"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in">
            {[
              {
                label: "Total Users",
                value: stats.total,
                icon: "👥",
                color: "from-blue-400 to-blue-600",
              },
              {
                label: "Active",
                value: stats.active,
                icon: "✅",
                color: "from-green-400 to-green-600",
              },
              {
                label: "Total Orders",
                value: stats.orders,
                icon: "📦",
                color: "from-purple-400 to-purple-600",
              },
              {
                label: "Total Reviews",
                value: stats.reviews,
                icon: "⭐",
                color: "from-yellow-400 to-yellow-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-xl p-6 transform hover:scale-105 transition-all duration-300`}
              >
                <div className="text-4xl mb-2">{s.icon}</div>
                <p className="text-sm font-semibold opacity-90">{s.label}</p>
                <p className="text-4xl font-extrabold mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-2xl border-2 border-orange-200 bg-white shadow-lg p-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-6 py-4 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-orange-200 bg-white font-bold shadow-md"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <div className="w-full md:max-w-md flex gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="🔍 Search by name / email / phone..."
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-orange-200 font-medium shadow-md"
                />
                <button
                  onClick={load}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-black to-gray-800 text-white font-bold hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border-2 border-orange-200 bg-white shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-6 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-between">
              <h2 className="text-2xl font-extrabold">Users List</h2>
              <p className="text-sm font-bold">
                Showing <span className="text-2xl">{users.length}</span>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-orange-50">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-orange-700 font-bold uppercase tracking-wide">
                      User
                    </th>
                    <th className="px-6 py-4 text-orange-700 font-bold uppercase tracking-wide">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-orange-700 font-bold uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-4 text-orange-700 font-bold uppercase tracking-wide">
                      Counts
                    </th>
                    <th className="px-6 py-4 text-orange-700 font-bold uppercase tracking-wide text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-orange-100">
                  {users.map((u) => {
                    const isActive = u.isActive !== false;
                    return (
                      <tr
                        key={u._id}
                        className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all"
                      >
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-black">
                            {u.name || "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {fmt(u.createdAt)}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {u.email || "—"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {u.phone || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${isActive ? "bg-green-100 border-green-300 text-green-700" : "bg-gray-100 border-gray-300 text-gray-700"}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}
                            />
                            <span className="font-bold">
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-700">
                            Orders:{" "}
                            <b className="text-orange-600">
                              {u.ordersCount || 0}
                            </b>{" "}
                            • Reviews:{" "}
                            <b className="text-orange-600">
                              {u.reviewsCount || 0}
                            </b>
                          </p>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openUser(u)}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-black to-gray-800 text-white font-bold hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg transform hover:scale-105"
                          >
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!users.length && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-6xl mb-4 opacity-50">👥</div>
                        <p className="text-gray-500 font-semibold">
                          No users found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {open && (
            <div
              className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
              onClick={close}
            >
              <div
                className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-orange-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 bg-gradient-to-r from-black via-orange-900 to-black text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-orange-300 text-sm font-bold">
                        User Details
                      </p>
                      <h3 className="text-3xl font-extrabold">
                        {details?.user?.name || selected?.name || "—"}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {details?.user?.email || selected?.email}
                      </p>
                      <p className="text-xs text-white/60 mt-2">
                        Status:{" "}
                        <span className="text-orange-300 font-bold">
                          {details?.user?.isActive === false
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={close}
                      className="text-white/90 hover:text-white text-4xl leading-none font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="px-8 pt-6 flex flex-wrap gap-2">
                  {["orders", "reviews", "activity", "profile"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-5 py-2 rounded-full border-2 font-bold transition-all ${
                        tab === t
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg"
                          : "bg-white text-black border-orange-200 hover:bg-orange-50"
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                  {!details?.user ? (
                    <p className="text-gray-600">Loading details...</p>
                  ) : (
                    <>
                      {tab === "profile" && (
                        <div className="rounded-2xl border-2 border-orange-200 p-6 bg-orange-50 space-y-3">
                          <p className="text-sm">
                            <b>Name:</b> {details.user.name}
                          </p>
                          <p className="text-sm">
                            <b>Email:</b> {details.user.email}
                          </p>
                          <p className="text-sm">
                            <b>Phone:</b> {details.user.phone || "—"}
                          </p>
                          <p className="text-sm">
                            <b>Address:</b> {details.user.address || "—"}
                          </p>
                          <p className="text-sm">
                            <b>Created:</b> {fmt(details.user.createdAt)}
                          </p>
                        </div>
                      )}

                      {tab === "orders" && (
                        <div className="space-y-3">
                          {(details.orders || []).map((o) => (
                            <div
                              key={o._id}
                              className="rounded-2xl border-2 border-orange-200 p-6 bg-orange-50"
                            >
                              <div className="flex flex-wrap gap-3 justify-between">
                                <p className="font-extrabold text-orange-600">
                                  Order: {o._id}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <b>Status:</b> {o.status || "—"} •{" "}
                                  <b>Total:</b> ৳{o.total ?? "—"}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {fmt(o.createdAt)}
                              </p>
                            </div>
                          ))}
                          {!details.orders?.length && (
                            <p className="text-gray-600">No orders found.</p>
                          )}
                        </div>
                      )}

                      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                          disabled={busy}
                          onClick={toggleActive}
                          className="px-6 py-3 rounded-xl border-2 border-orange-200 bg-white hover:bg-orange-50 font-bold text-black transition-all disabled:opacity-60 shadow-lg"
                        >
                          {details.user.isActive === false
                            ? "✅ Activate User"
                            : "🚫 Deactivate User"}
                        </button>

                        <button
                          disabled={busy}
                          onClick={deleteUser}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-60 shadow-lg"
                        >
                          🗑️ Delete User
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
