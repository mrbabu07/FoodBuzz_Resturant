// path: backend_sara/project/src/pages/ManageStaffPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../utils/api";
import { getUser } from "../utils/authStorage";

import AdminFooter from "../components/AdminFooter";
import AdminNavbar from "../components/AdminNavbar";

const modalAnim = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
  exit: { opacity: 0, scale: 0.98, y: 10, transition: { duration: 0.15 } },
};

function badge(role) {
  if (role === "admin") return "bg-black text-white border-black";
  if (role === "staff") return "bg-orange-500 text-white border-orange-500";
  return "bg-white text-black border-orange-200";
}

function fmt(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d || "");
    return dt.toLocaleString();
  } catch {
    return String(d || "");
  }
}

export default function ManageStaffPage() {
  // ✅ Admin guard (JWT based user)
  const me = getUser();
  if (!me) return <Navigate to="/login" replace />;
  if (String(me.role || "").toLowerCase() !== "admin") return <Navigate to="/" replace />;

  // ✅ Sidebar state (AdminNavbar expects this)
  const [navOpen, setNavOpen] = useState(true);

  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all/active/inactive
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create/edit/resetpass
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    id: "",
    name: "",
    email: "",
    phone: "",
    isActive: true,
    password: "", // only for create/reset
  };

  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const params = new URLSearchParams();
      if (q.trim()) params.set("search", q.trim());
      if (activeFilter === "active") params.set("active", "true");
      else if (activeFilter === "inactive") params.set("active", "false");
      else params.set("active", "all");

      const data = await apiFetch(`/api/admin/staff?${params.toString()}`, { method: "GET" });
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load staff");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔎 live search debounce (small)
  useEffect(() => {
    const t = setTimeout(() => load(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, activeFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive !== false).length;
    const staff = users.filter((u) => u.role === "staff").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total, active, staff, admins };
  }, [users]);

  const openCreate = () => {
    setMode("create");
    setForm({ ...emptyForm, isActive: true, password: "" });
    setOpen(true);
  };

  const openEdit = (u) => {
    setMode("edit");
    setForm({
      id: u._id,
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      isActive: u.isActive !== false,
      password: "",
    });
    setOpen(true);
  };

  const openResetPass = (u) => {
    setMode("resetpass");
    setForm({
      id: u._id,
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      isActive: u.isActive !== false,
      password: "",
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setForm(emptyForm);
  };

  const onSave = async () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const isActive = form.isActive !== false;

    if (!name || !email) {
      alert("Name and Email লাগবে!");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        // ✅ password required OR leave empty to auto-generate backend
        const payload = { name, email, phone };
        if (form.password.trim()) payload.password = form.password.trim();

        await apiFetch("/api/admin/staff", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        alert("✅ Staff created. Email + Password staff email এ পাঠানো হয়েছে (SMTP ঠিক থাকলে)।");
        close();
        await load();
        return;
      }

      if (mode === "edit") {
        await apiFetch(`/api/admin/staff/${form.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name, phone, isActive }),
        });
        close();
        await load();
        return;
      }

      if (mode === "resetpass") {
        // ✅ if empty, backend auto generate করে email করবে
        const payload = {};
        if (form.password.trim()) payload.password = form.password.trim();

        await apiFetch(`/api/admin/staff/${form.id}/password`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        alert("✅ Password reset done. New password staff email এ গেছে (SMTP ঠিক থাকলে)।");
        close();
        await load();
        return;
      }
    } catch (e) {
      alert(e?.message || "Action failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    // prevent self deactivation
    if (String(u?._id) === String(me?.id || me?._id || "")) {
      alert("নিজের account deactivate করা যাবে না 🙂");
      return;
    }
    try {
      await apiFetch(`/api/admin/staff/${u._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !(u.isActive !== false) }),
      });
      await load();
    } catch (e) {
      alert(e?.message || "Failed");
    }
  };

  const removeUser = async (u) => {
    if (!confirm(`Delete ${u.name || u.email}?`)) return;
    try {
      await apiFetch(`/api/admin/staff/${u._id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert(e?.message || "Failed");
    }
  };

  // ✅ Admin layout spacing (same as ManageUsersPage)
  const sidebarPad = navOpen ? "md:pl-64" : "md:pl-20";

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ Admin Sidebar */}
      <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />

      <div className={`${sidebarPad} transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Top Banner */}
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
                <p className="text-orange-300 text-sm font-semibold">Admin Panel</p>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                  Manage Staff 🧑‍🍳
                </h1>
                <p className="text-white/80 mt-2">
                  Create staff accounts, reset passwords, and deactivate when needed.
                </p>
                <p className="text-xs text-white/60 mt-3">
                  Logged as:{" "}
                  <span className="text-orange-300 font-bold">
                    {me?.name || me?.fullName || me?.email}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={openCreate}
                  className="px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 transition font-extrabold"
                >
                  + Create Staff
                </button>
              </div>
            </div>

            <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Total", value: stats.total },
              { label: "Active", value: stats.active },
              { label: "Staff", value: stats.staff },
              { label: "Admins", value: stats.admins },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-orange-200 bg-white shadow p-4"
              >
                <p className="text-sm text-gray-600">{s.label}</p>
                <p className="text-3xl font-extrabold text-orange-600 mt-1">{s.value}</p>
                <div className="h-1 mt-3 rounded-full bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-80" />
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-6 rounded-2xl border border-orange-200 bg-white shadow p-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="w-full md:max-w-md">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name / email / phone..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 rounded-2xl border border-orange-200 bg-white shadow overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-orange-600">Staff Accounts</h2>
              <p className="text-sm text-gray-600">
                {loading ? (
                  "Loading..."
                ) : err ? (
                  <span className="text-red-600">{err}</span>
                ) : (
                  <>
                    Showing <span className="font-bold">{users.length}</span>
                  </>
                )}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-orange-50">
                  <tr className="text-left">
                    <th className="px-5 py-3 text-orange-700 font-bold">Staff</th>
                    <th className="px-5 py-3 text-orange-700 font-bold">Contact</th>
                    <th className="px-5 py-3 text-orange-700 font-bold">Role</th>
                    <th className="px-5 py-3 text-orange-700 font-bold">Status</th>
                    <th className="px-5 py-3 text-orange-700 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-orange-100">
                  {!loading &&
                    !err &&
                    users.map((u) => {
                      const isActive = u.isActive !== false;
                      return (
                        <tr key={u._id} className="hover:bg-orange-50/60 transition">
                          <td className="px-5 py-4">
                            <p className="font-extrabold text-black">{u.name || "—"}</p>
                            <p className="text-xs text-gray-500">
                              {u._id} • {fmt(u.createdAt)}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-800">{u.email || "—"}</p>
                            <p className="text-xs text-gray-600">{u.phone || "—"}</p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full border font-extrabold ${badge(
                                u.role
                              )}`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                                isActive
                                  ? "bg-white border-orange-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isActive ? "bg-orange-500" : "bg-gray-400"
                                }`}
                              />
                              <span className="font-bold text-gray-800">
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2 flex-wrap">
                              <button
                                onClick={() => openEdit(u)}
                                className="px-3 py-2 rounded-lg bg-black text-white font-bold hover:bg-orange-500 transition"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => openResetPass(u)}
                                className="px-3 py-2 rounded-lg border border-orange-200 bg-white text-black font-extrabold hover:bg-orange-50 transition"
                              >
                                Reset Pass
                              </button>

                              <button
                                onClick={() => toggleActive(u)}
                                className={`px-3 py-2 rounded-lg font-extrabold transition border ${
                                  isActive
                                    ? "bg-white text-black border-orange-200 hover:bg-orange-50"
                                    : "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                                }`}
                              >
                                {isActive ? "Deactivate" : "Activate"}
                              </button>

                              <button
                                onClick={() => removeUser(u)}
                                className="px-3 py-2 rounded-lg bg-red-600 text-white font-extrabold hover:bg-red-700 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  {!loading && !err && !users.length && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                        No staff found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="h-2 bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-90" />
          </div>

          {/* Modal */}
          <AnimatePresence>
            {open && (
              <div
                className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
                onClick={close}
              >
                <motion.div
                  variants={modalAnim}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-orange-200 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 bg-black text-white relative">
                    <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-orange-300 text-sm font-semibold">
                          {mode === "create"
                            ? "Create Staff"
                            : mode === "edit"
                            ? "Edit Staff"
                            : "Reset Password"}
                        </p>
                        <h3 className="text-2xl font-extrabold">{form.email || "—"}</h3>
                        <p className="text-white/80 text-sm mt-1">
                          Role: <span className="font-bold text-orange-300">staff</span>
                        </p>
                      </div>
                      <button
                        onClick={close}
                        className="text-white/90 hover:text-white text-3xl leading-none font-bold"
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {(mode === "create" || mode === "edit") && (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-bold text-black">Name</label>
                            <input
                              value={form.name}
                              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                              className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="e.g. Sara Ahmed"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-bold text-black">Email</label>
                            <input
                              value={form.email}
                              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                              disabled={mode === "edit"}
                              className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50"
                              placeholder="e.g. sara@mail.com"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-bold text-black">Phone</label>
                            <input
                              value={form.phone}
                              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                              className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="01XXXXXXXXX"
                            />
                          </div>

                          <div className="flex items-end">
                            <label className="inline-flex items-center gap-2 text-sm font-bold text-black">
                              <input
                                type="checkbox"
                                checked={form.isActive !== false}
                                onChange={(e) =>
                                  setForm((p) => ({ ...p, isActive: e.target.checked }))
                                }
                              />
                              Active account
                            </label>
                          </div>
                        </div>

                        {mode === "create" && (
                          <div>
                            <label className="text-sm font-bold text-black">
                              Password (optional)
                            </label>
                            <input
                              value={form.password}
                              onChange={(e) =>
                                setForm((p) => ({ ...p, password: e.target.value }))
                              }
                              className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Leave empty = auto-generate and email will be sent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Create হলে staff email এ credentials যাবে (SMTP ঠিক থাকলে)।
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {mode === "resetpass" && (
                      <div>
                        <label className="text-sm font-bold text-black">
                          New Password (optional)
                        </label>
                        <input
                          value={form.password}
                          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                          className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Leave empty = auto-generate and email will be sent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Reset করলে new password staff email এ যাবে (SMTP ঠিক থাকলে)।
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={close}
                        className="px-5 py-2 rounded-xl border border-orange-200 bg-white hover:bg-orange-50 font-extrabold text-black transition"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={saving}
                        onClick={onSave}
                        className="px-5 py-2 rounded-xl bg-orange-500 text-white font-extrabold hover:bg-orange-600 transition disabled:opacity-60"
                      >
                        {saving
                          ? "Saving..."
                          : mode === "create"
                          ? "Create"
                          : mode === "edit"
                          ? "Update"
                          : "Reset"}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500">
                      Backend API: /api/admin/staff (admin only). Token লাগবে।
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ✅ Footer */}
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
