// src/pages/ManageProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

  const [msg, setMsg] = useState({ type: "", text: "" });

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
    setMsg({ type: "", text: "" });
    setForm((p) => ({ ...p, [name]: value }));
  };

  const emailOk = useMemo(() => {
    const v = (form.email || "").trim().toLowerCase();
    if (!v) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [form.email]);

  const handleUpdate = (e) => {
    e.preventDefault();

    if (!me) return setMsg({ type: "err", text: "Please login first." });

    const username = form.username.trim();
    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const address = form.address.trim();

    if (!username || !fullName || !email) {
      return setMsg({ type: "err", text: "Username, Full Name, Email required." });
    }
    if (!emailOk) {
      return setMsg({ type: "err", text: "Please enter a valid email." });
    }

    // password change (optional)
    let willChangePass = false;
    if (form.oldPassword || form.newPassword || form.confirmPassword) {
      willChangePass = true;
      if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
        return setMsg({ type: "err", text: "Password change fields are incomplete." });
      }
      if (form.newPassword.length < 6) {
        return setMsg({ type: "err", text: "New password must be at least 6 characters." });
      }
      if (form.newPassword !== form.confirmPassword) {
        return setMsg({ type: "err", text: "New password and confirm password do not match." });
      }
    }

    // update roms_users (if you are using it)
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === me.id);
    if (idx !== -1) {
      // old password verify only if changing pass
      if (willChangePass && users[idx].password !== form.oldPassword) {
        return setMsg({ type: "err", text: "Old password is incorrect." });
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

    setMsg({ type: "ok", text: "✅ Profile updated successfully!" });
  };

  const handleDelete = () => {
    if (!me) return;

    // remove from users (demo)
    const users = getUsers().filter((u) => u.id !== me.id);
    setUsers(users);

    // remove session
    localStorage.removeItem("roms_current_user");
    setMsg({ type: "ok", text: "Account deleted. Redirecting..." });

    setTimeout(() => navigate("/"), 700);
  };

  return (
    <main
      className="min-h-screen bg-black text-white px-4 py-10"
      style={{
        backgroundImage: "radial-gradient(circle at 20% 10%, rgba(249,115,22,0.35), transparent 45%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.12), transparent 40%), radial-gradient(circle at 50% 90%, rgba(249,115,22,0.25), transparent 45%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top mini header */}
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-extrabold">
              F
            </div>
            <div className="leading-tight">
              <p className="font-extrabold text-white">FoodBaZZ</p>
              <p className="text-xs text-white/60 -mt-0.5">Manage Profile</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="px-4 py-2 rounded-full border border-orange-500 text-orange-200 hover:bg-orange-500 hover:text-white transition font-semibold"
          >
            Back to Profile
          </Link>
        </div>

        {/* Card */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_80px_rgba(249,115,22,0.25)] overflow-hidden">
          {/* Header strip */}
          <div className="relative px-6 py-6 bg-gradient-to-r from-black via-black to-orange-600/30">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative z-10">
              <p className="text-orange-300 text-sm font-semibold">Account Settings</p>
              <h1 className="text-3xl md:text-4xl font-extrabold">Manage Profile 🍜</h1>
              <p className="text-white/70 mt-2 text-sm">
                Update your basic info and password.
              </p>
            </div>

            <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
          </div>

          <div className="p-6 md:p-8">
            {msg.text && (
              <div
                className={`mb-6 px-4 py-3 rounded-2xl border text-sm font-semibold ${
                  msg.type === "ok"
                    ? "bg-orange-500/10 text-orange-200 border-orange-500/30"
                    : "bg-red-500/10 text-red-200 border-red-500/30"
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-8">
              {/* Basic info */}
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Username" hint="Public name (can be unique)">
                  <input
                    name="username"
                    value={form.username}
                    onChange={onChange}
                    placeholder="your_username"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/40 transition"
                  />
                </Field>

                <Field label="Full Name" hint="Real name for delivery & receipts">
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={onChange}
                    placeholder="Your Full Name"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/40 transition"
                  />
                </Field>

                <Field label="Email" hint="Used for login & receipt email">
                  <input
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/40 transition"
                  />
                  {!!form.email && !emailOk && (
                    <p className="text-xs text-red-300 mt-2">Invalid email format.</p>
                  )}
                </Field>

                <Field label="Address" hint="Delivery address (optional)">
                  <input
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Chittagong, Bangladesh"
                    className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500/40 transition"
                  />
                </Field>
              </div>

              {/* Password change */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-orange-200">
                      Change Password
                    </h2>
                    <p className="text-sm text-white/60 mt-1">
                      Leave empty if you don’t want to change.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 border border-orange-500/30 text-orange-200">
                    Optional
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-5">
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
                    label="Confirm"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={onChange}
                    show={show.confirm}
                    setShow={(v) => setShow((p) => ({ ...p, confirm: v }))}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 transition font-extrabold shadow-lg shadow-orange-500/20"
                >
                  Update Profile
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 transition font-extrabold shadow-lg shadow-red-600/20"
                >
                  Delete Account
                </button>
              </div>

              {/* Bottom boundary */}
              <div className="pt-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
                <p className="text-xs text-white/50 text-center mt-4">
                  FoodBaZZ • Profile settings • Demo localStorage
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

// ---------- Small UI helpers ----------
function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-bold text-white">{label}</label>
        {hint ? <span className="text-xs text-white/50">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function PasswordField({ label, name, value, onChange, show, setShow }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-white">{label}</label>
      <div className="flex items-center rounded-2xl overflow-hidden bg-black/40 border border-white/10 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500/40 transition">
        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="w-full px-4 py-3 bg-transparent outline-none"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="px-4 py-3 text-sm font-extrabold text-orange-200 hover:bg-white/5 transition"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
