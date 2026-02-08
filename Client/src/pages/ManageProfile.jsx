// src/pages/ManageProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";

export default function ManageProfile() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);

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
    }
  }, []);

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
                  👤
                </div>
                <div>
                  <p className="text-purple-100 text-sm font-semibold">
                    Account Settings
                  </p>
                  <h1 className="text-4xl font-black">Manage Profile</h1>
                </div>
              </div>
              <p className="text-purple-100 text-lg">
                Update your basic info and password
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl font-bold transition-all text-center"
              >
                🏠 Home
              </Link>
              <Link
                to="/profile"
                className="px-6 py-3 bg-white text-purple-600 hover:bg-purple-50 rounded-2xl font-bold transition-all text-center"
              >
                📊 Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-purple-100 p-8">
          <form onSubmit={handleUpdate} className="space-y-8">
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-6 border-t-2 border-slate-200">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                💾 Update Profile
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                🗑️ Delete Account
              </button>
            </div>
          </form>
        </div>

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
