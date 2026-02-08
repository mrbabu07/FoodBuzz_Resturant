import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { showSuccess, showError } from "../utils/toast";
import { apiFetch } from "../utils/api";
import { getUser } from "../utils/authStorage";

export default function ManageStaffPage() {
  const me = getUser();
  if (!me) return <Navigate to="/login" replace />;
  if (String(me.role || "").toLowerCase() !== "admin")
    return <Navigate to="/" replace />;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    isActive: true,
  });

  useEffect(() => {
    loadStaff();
  }, [activeFilter]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilter === "active") params.set("active", "true");
      else if (activeFilter === "inactive") params.set("active", "false");
      else params.set("active", "all");

      const data = await apiFetch(`/api/admin/staff?${params.toString()}`);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      showError("Failed to load staff");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive !== false).length;
    const staff = users.filter((u) => u.role === "staff").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total, active, staff, admins };
  }, [users]);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setFormData({
      id: user._id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      isActive: user.isActive !== false,
    });
    setShowModal(true);
  };

  const openResetPasswordModal = (user) => {
    setModalMode("resetpass");
    setFormData({
      id: user._id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      isActive: user.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      showError("Name and Email are required");
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "create") {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
        };
        if (formData.password.trim())
          payload.password = formData.password.trim();

        await apiFetch("/api/admin/staff", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        showSuccess("Staff created successfully! Credentials sent via email.");
      } else if (modalMode === "edit") {
        await apiFetch(`/api/admin/staff/${formData.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            isActive: formData.isActive,
          }),
        });

        showSuccess("Staff updated successfully!");
      } else if (modalMode === "resetpass") {
        const payload = {};
        if (formData.password.trim())
          payload.password = formData.password.trim();

        await apiFetch(`/api/admin/staff/${formData.id}/password`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        showSuccess(
          "Password reset successfully! New password sent via email.",
        );
      }

      setShowModal(false);
      loadStaff();
    } catch (error) {
      showError(error.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user) => {
    if (String(user._id) === String(me?.id || me?._id)) {
      showError("You cannot deactivate your own account");
      return;
    }

    try {
      await apiFetch(`/api/admin/staff/${user._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      showSuccess(
        `Staff ${user.isActive ? "deactivated" : "activated"} successfully`,
      );
      loadStaff();
    } catch (error) {
      showError("Failed to update status");
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Are you sure you want to delete ${user.name || user.email}?`))
      return;

    try {
      await apiFetch(`/api/admin/staff/${user._id}`, { method: "DELETE" });
      showSuccess("Staff deleted successfully");
      loadStaff();
    } catch (error) {
      showError("Failed to delete staff");
    }
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          Admin
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        Staff
      </span>
    );
  };

  return (
    <AdminLayout
      title="Staff Management"
      subtitle="Manage staff accounts and permissions"
      icon="👥"
    >
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-black">{stats.total}</div>
          <div className="text-sm font-semibold opacity-90">Total Staff</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-black">{stats.active}</div>
          <div className="text-sm font-semibold opacity-90">Active</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">🧑‍🍳</div>
          <div className="text-3xl font-black">{stats.staff}</div>
          <div className="text-sm font-semibold opacity-90">Staff Members</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">👑</div>
          <div className="text-3xl font-black">{stats.admins}</div>
          <div className="text-sm font-semibold opacity-90">Admins</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Search staff by name or email..."
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

          {/* Filter */}
          <div className="flex gap-2">
            {["all", "active", "inactive"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 capitalize ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Add Button */}
          <button
            onClick={openCreateModal}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 whitespace-nowrap"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Staff
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
            </div>
            <p className="text-slate-600 text-xl font-bold">Loading staff...</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-20 text-center">
          <div className="text-8xl mb-6">👥</div>
          <h3 className="text-3xl font-black text-slate-800 mb-4">
            No Staff Found
          </h3>
          <p className="text-slate-600 text-lg mb-8">
            {searchTerm
              ? "Try a different search term"
              : "Start by adding your first staff member"}
          </p>
          <button
            onClick={openCreateModal}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Add First Staff
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {user.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">
                      {user.name}
                    </h3>
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-semibold">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg
                      className="w-5 h-5"
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
                    <span className="text-sm font-semibold">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openEditModal(user)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => openResetPasswordModal(user)}
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm"
                >
                  Reset Pass
                </button>
                <button
                  onClick={() => toggleActive(user)}
                  className={`px-4 py-3 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm ${
                    user.isActive
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  }`}
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black">
                  {modalMode === "create"
                    ? "Add New Staff"
                    : modalMode === "edit"
                      ? "Edit Staff"
                      : "Reset Password"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={modalMode === "resetpass"}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all disabled:bg-slate-100"
                  placeholder="e.g., John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={modalMode !== "create"}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all disabled:bg-slate-100"
                  placeholder="e.g., john@example.com"
                />
              </div>

              {/* Phone */}
              {modalMode !== "resetpass" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                    placeholder="e.g., +880 1234567890"
                  />
                </div>
              )}

              {/* Password */}
              {(modalMode === "create" || modalMode === "resetpass") && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Password {modalMode === "create" && "(Optional)"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                    placeholder="Leave empty to auto-generate"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    {modalMode === "create"
                      ? "If left empty, a password will be auto-generated and sent via email"
                      : "Leave empty to auto-generate a new password"}
                  </p>
                </div>
              )}

              {/* Active Status */}
              {modalMode === "edit" && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-6 h-6 rounded-lg border-2 border-slate-300 text-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                  <label className="text-sm font-bold text-slate-700">
                    Active Account
                  </label>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving..."
                    : modalMode === "create"
                      ? "Create Staff"
                      : modalMode === "edit"
                        ? "Update Staff"
                        : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
