// src/pages/ManageProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";

export default function ManageProfile() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // profile, dashboard

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    address: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    old: false,
    next: false,
    confirm: false,
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalRecipes: 0,
    recentOrders: [],
  });

  // ------- Helpers (localStorage demo) -------
  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem("roms_users") || "[]");
    } catch {
      return [];
    }
  };

  const setUsers = (users) => {
    localStorage.setItem("roms_users", JSON.stringify(users));
  };

  // ------- Load current user -------
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("roms_current_user") || "null");
    setMe(u);

    if (u) {
      setForm((p) => ({
        ...p,
        username: u.username || "",
        fullName: u.fullName || "",
        email: u.email || "",
        address: u.address || "",
      }));
      setPreviewUrl(u.profilePicture || null);

      // Load dashboard stats if admin or staff
      if (u.role === "admin" || u.role === "staff") {
        loadDashboardStats();
      }
    }
  }, []);

  // Load dashboard statistics
  const loadDashboardStats = async () => {
    try {
      // Get orders from localStorage (demo)
      const orders = JSON.parse(localStorage.getItem("roms_orders") || "[]");
      const users = JSON.parse(localStorage.getItem("roms_users") || "[]");

      // Calculate stats
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = (order.items || []).reduce(
          (itemSum, item) => itemSum + item.price * item.qty,
          0,
        );
        return sum + orderTotal;
      }, 0);
      const totalUsers = users.length;

      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setDashboardStats({
        totalOrders,
        totalRevenue,
        totalUsers,
        totalRecipes: Math.floor(Math.random() * 50) + 20, // Demo
        recentOrders,
      });
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    }
  };

  // Handle profile picture upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Please select an image file");
      return;
    }

    setProfilePicture(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const emailOk = useMemo(() => {
    const v = (form.email || "").trim().toLowerCase();
    if (!v) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [form.email]);

  const handleUpdate = (e) => {
    e.preventDefault();

    if (!me) {
      showError("Please login first");
      return;
    }

    const username = form.username.trim();
    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const address = form.address.trim();

    if (!username || !fullName || !email) {
      showError("Username, Full Name, Email required");
      return;
    }
    if (!emailOk) {
      showError("Please enter a valid email");
      return;
    }

    // password change (optional)
    let willChangePass = false;
    if (form.oldPassword || form.newPassword || form.confirmPassword) {
      willChangePass = true;
      if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
        showError("Password change fields are incomplete");
        return;
      }
      if (form.newPassword.length < 6) {
        showError("New password must be at least 6 characters");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        showError("New password and confirm password do not match");
        return;
      }
    }

    // update roms_users (if you are using it)
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === me.id);
    if (idx !== -1) {
      // old password verify only if changing pass
      if (willChangePass && users[idx].password !== form.oldPassword) {
        showError("Old password is incorrect");
        return;
      }

      users[idx] = {
        ...users[idx],
        username,
        fullName,
        email,
        address,
        ...(willChangePass ? { password: form.newPassword } : {}),
      };
      setUsers(users);
    }

    // update current session
    const updatedMe = {
      ...me,
      username,
      fullName,
      email,
      address,
      profilePicture: previewUrl || me.profilePicture,
    };
    localStorage.setItem("roms_current_user", JSON.stringify(updatedMe));
    setMe(updatedMe);

    setForm((p) => ({
      ...p,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));

    showSuccess("✅ Profile updated successfully!");
  };

  const handleDelete = () => {
    if (!me) return;

    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    // remove from users (demo)
    const users = getUsers().filter((u) => u.id !== me.id);
    setUsers(users);

    // remove session
    localStorage.removeItem("roms_current_user");
    showSuccess("Account deleted. Redirecting...");

    setTimeout(() => navigate("/"), 700);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-500 text-white py-12 px-8 rounded-3xl shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl">
                  {me?.role === "admin"
                    ? "👑"
                    : me?.role === "staff"
                      ? "👨‍💼"
                      : "👤"}
                </div>
                <div>
                  <p className="text-purple-100 text-sm font-semibold">
                    {me?.role === "admin"
                      ? "Admin Panel"
                      : me?.role === "staff"
                        ? "Staff Panel"
                        : "Account Settings"}
                  </p>
                  <h1 className="text-4xl font-black">
                    {me?.role === "admin" || me?.role === "staff"
                      ? "Dashboard & Profile"
                      : "Manage Profile"}
                  </h1>
                </div>
              </div>
              <p className="text-purple-100 text-lg">
                {me?.role === "admin"
                  ? "View analytics, manage orders, and update your profile"
                  : me?.role === "staff"
                    ? "Track orders, view stats, and manage your account"
                    : "Update your basic info and password"}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl font-bold transition-all text-center"
              >
                🏠 Home
              </Link>
              {(me?.role === "admin" || me?.role === "staff") && (
                <Link
                  to={
                    me?.role === "admin"
                      ? "/admindashboard"
                      : "/staff/dashboard"
                  }
                  className="px-6 py-3 bg-white text-purple-600 hover:bg-purple-50 rounded-2xl font-bold transition-all text-center"
                >
                  📊 Full Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                className="px-6 py-3 bg-white text-purple-600 hover:bg-purple-50 rounded-2xl font-bold transition-all text-center"
              >
                📊 User Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation for Admin/Staff */}
        {(me?.role === "admin" || me?.role === "staff") && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-purple-100 p-2 mb-8 flex gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-purple-50"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-purple-50"
              }`}
            >
              👤 Profile Settings
            </button>
          </div>
        )}

        {/* Dashboard View (Admin/Staff Only) */}
        {(me?.role === "admin" || me?.role === "staff") &&
          activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-2xl">
                      🛒
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      TOTAL
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">
                    {dashboardStats.totalOrders}
                  </h3>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Orders
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-green-100 p-6 hover:shadow-2xl hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-2xl">
                      💰
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      REVENUE
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">
                    ৳{dashboardStats.totalRevenue.toFixed(0)}
                  </h3>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Revenue
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-blue-100 p-6 hover:shadow-2xl hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl">
                      👥
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      USERS
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">
                    {dashboardStats.totalUsers}
                  </h3>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Users
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-purple-100 p-6 hover:shadow-2xl hover:scale-105 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                      📚
                    </div>
                    <span className="text-xs font-bold text-gray-500">
                      RECIPES
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">
                    {dashboardStats.totalRecipes}
                  </h3>
                  <p className="text-sm text-gray-600 font-semibold">
                    Total Recipes
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">
                      Recent Orders
                    </h2>
                    <p className="text-gray-600">
                      Latest orders from customers
                    </p>
                  </div>
                  <Link
                    to={
                      me?.role === "admin"
                        ? "/manageordersadmin"
                        : "/staff/orders"
                    }
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    View All Orders
                  </Link>
                </div>

                <div className="space-y-3">
                  {dashboardStats.recentOrders.length === 0 ? (
                    <div className="text-center py-12 bg-purple-50 rounded-2xl">
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-gray-600 font-semibold">
                        No orders yet
                      </p>
                    </div>
                  ) : (
                    dashboardStats.recentOrders.map((order, index) => (
                      <div
                        key={order.id || index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 hover:shadow-lg hover:scale-[1.02] transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-black text-gray-900">
                              Order {order.id || order._id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.items?.length || 0} items •{" "}
                              {order.userEmail || "Customer"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-900">
                            ৳
                            {(order.items || [])
                              .reduce(
                                (sum, item) => sum + item.price * item.qty,
                                0,
                              )
                              .toFixed(2)}
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : order.status === "Processing"
                                  ? "bg-blue-100 text-blue-700"
                                  : order.status === "Cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  to={
                    me?.role === "admin"
                      ? "/manageordersadmin"
                      : "/staff/orders"
                  }
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all text-center group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    📦
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    Manage Orders
                  </h3>
                  <p className="text-sm text-gray-600">
                    View and update order status
                  </p>
                </Link>

                <Link
                  to={me?.role === "admin" ? "/managemenuadmin" : "/order_1st"}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-green-100 p-6 hover:shadow-2xl hover:scale-105 transition-all text-center group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    🍽️
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {me?.role === "admin" ? "Manage Menu" : "View Menu"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {me?.role === "admin"
                      ? "Add, edit, or remove items"
                      : "Browse available items"}
                  </p>
                </Link>

                <Link
                  to={me?.role === "admin" ? "/manageusers" : "/profile"}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-blue-100 p-6 hover:shadow-2xl hover:scale-105 transition-all text-center group"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    👥
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {me?.role === "admin" ? "Manage Users" : "My Profile"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {me?.role === "admin"
                      ? "View and manage user accounts"
                      : "View your account details"}
                  </p>
                </Link>
              </div>
            </div>
          )}

        {/* Profile Form (Always visible for customers, tab for admin/staff) */}
        {(me?.role !== "admin" && me?.role !== "staff") ||
        activeTab === "profile" ? (
          <>
            {/* Profile Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-purple-100 p-8">
              <form onSubmit={handleUpdate} className="space-y-8">
                {/* Profile Picture Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                      📸
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">
                        Profile Picture
                      </h2>
                      <p className="text-sm text-slate-600">
                        Upload your photo (Max 5MB)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Profile Picture Preview */}
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-300 shadow-xl bg-gradient-to-br from-purple-100 to-pink-100">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            👤
                          </div>
                        )}
                      </div>
                      {previewUrl && (
                        <button
                          type="button"
                          onClick={removeProfilePicture}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <div className="px-6 py-4 bg-white border-2 border-purple-300 rounded-2xl cursor-pointer hover:bg-purple-50 hover:border-purple-500 transition-all text-center">
                          <div className="text-purple-600 font-bold mb-1">
                            📤 Choose Photo
                          </div>
                          <div className="text-xs text-slate-600">
                            JPG, PNG or GIF (Max 5MB)
                          </div>
                        </div>
                      </label>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Your profile picture helps others recognize you
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Info Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                      📝
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">
                        Basic Information
                      </h2>
                      <p className="text-sm text-slate-600">
                        Update your personal details
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Field label="Username" hint="Public name">
                      <input
                        name="username"
                        value={form.username}
                        onChange={onChange}
                        placeholder="your_username"
                        className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-lg"
                      />
                    </Field>

                    <Field label="Full Name" hint="Real name for delivery">
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={onChange}
                        placeholder="Your Full Name"
                        className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-lg"
                      />
                    </Field>

                    <Field label="Email" hint="Used for login & receipts">
                      <input
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="example@email.com"
                        className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-lg"
                      />
                      {!!form.email && !emailOk && (
                        <p className="text-xs text-red-500 mt-2 font-semibold">
                          ⚠️ Invalid email format
                        </p>
                      )}
                    </Field>

                    <Field label="Address" hint="Delivery address (optional)">
                      <input
                        name="address"
                        value={form.address}
                        onChange={onChange}
                        placeholder="Chittagong, Bangladesh"
                        className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-lg"
                      />
                    </Field>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 p-6">
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                        🔒
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-800">
                          Change Password
                        </h2>
                        <p className="text-sm text-slate-600">
                          Leave empty if you don't want to change
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 rounded-full text-xs font-bold bg-purple-500/20 border-2 border-purple-500/30 text-purple-700">
                      Optional
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <PasswordField
                      label="Old Password"
                      name="oldPassword"
                      value={form.oldPassword}
                      onChange={onChange}
                      show={show.old}
                      setShow={(v) => setShow((p) => ({ ...p, old: v }))}
                    />
                    <PasswordField
                      label="New Password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={onChange}
                      show={show.next}
                      setShow={(v) => setShow((p) => ({ ...p, next: v }))}
                    />
                    <PasswordField
                      label="Confirm Password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={onChange}
                      show={show.confirm}
                      setShow={(v) => setShow((p) => ({ ...p, confirm: v }))}
                    />
                  </div>
                </div>

                {/* Account Activity Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl border-2 border-blue-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl">
                      📊
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">
                        Account Activity
                      </h2>
                      <p className="text-sm text-slate-600">
                        Your account information and statistics
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-4 border-2 border-blue-200">
                      <div className="text-3xl mb-2">📅</div>
                      <div className="text-sm text-slate-600 mb-1">
                        Member Since
                      </div>
                      <div className="text-lg font-black text-slate-800">
                        {new Date().toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border-2 border-blue-200">
                      <div className="text-3xl mb-2">🛒</div>
                      <div className="text-sm text-slate-600 mb-1">
                        Total Orders
                      </div>
                      <div className="text-lg font-black text-slate-800">
                        {Math.floor(Math.random() * 20) + 5}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border-2 border-blue-200">
                      <div className="text-3xl mb-2">⭐</div>
                      <div className="text-sm text-slate-600 mb-1">
                        Reviews Written
                      </div>
                      <div className="text-lg font-black text-slate-800">
                        {Math.floor(Math.random() * 10) + 2}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-2xl border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-600 mb-1">
                          Last Login
                        </div>
                        <div className="text-base font-bold text-slate-800">
                          {new Date().toLocaleString()}
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-6 border-t-2 border-slate-200">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>💾</span>
                    <span>Update Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span>
                    <span>Delete Account</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <Link
                to="/favorites"
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-purple-100 p-6 hover:shadow-xl hover:scale-105 transition-all text-center group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  ❤️
                </div>
                <div className="text-lg font-black text-slate-800 mb-2">
                  My Favorites
                </div>
                <div className="text-sm text-slate-600">
                  View saved recipes & items
                </div>
              </Link>

              <Link
                to="/order_tracking"
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-purple-100 p-6 hover:shadow-xl hover:scale-105 transition-all text-center group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  📦
                </div>
                <div className="text-lg font-black text-slate-800 mb-2">
                  My Orders
                </div>
                <div className="text-sm text-slate-600">Track your orders</div>
              </Link>

              <Link
                to="/reviews"
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-purple-100 p-6 hover:shadow-xl hover:scale-105 transition-all text-center group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  ⭐
                </div>
                <div className="text-lg font-black text-slate-800 mb-2">
                  My Reviews
                </div>
                <div className="text-sm text-slate-600">View your reviews</div>
              </Link>
            </div>
          </>
        ) : null}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            FoodBaZZ • Profile settings • Secure & Private
          </p>
        </div>
      </div>
    </main>
  );
}

// ---------- Small UI helpers ----------
function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-bold text-slate-800">{label}</label>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function PasswordField({ label, name, value, onChange, show, setShow }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-800">{label}</label>
      <div className="flex items-center rounded-2xl overflow-hidden border-2 border-slate-200 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100 transition-all bg-white">
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="w-full px-4 py-4 bg-transparent outline-none text-lg"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="px-4 py-4 text-sm font-bold text-purple-600 hover:bg-purple-50 transition-all"
        >
          {show ? "👁️" : "👁️‍🗨️"}
        </button>
      </div>
    </div>
  );
}
