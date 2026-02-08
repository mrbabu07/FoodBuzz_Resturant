// Path: backend_sara/project/src/pages/LoginPage.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { setAuth } from "../utils/authStorage";
import { showLoginSuccess, showError } from "../utils/toast";
import { initializeTawk } from "../utils/tawkTo";
import OfferModal from "../components/OfferModal";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const emailOk = useMemo(() => {
    const v = form.email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [form.email]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setMsg({ type: "", text: "" });
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      return setMsg({ type: "err", text: "ইমেইল আর পাসওয়ার্ড দাও।" });
    }
    if (!emailOk) {
      return setMsg({ type: "err", text: "সঠিক ইমেইল দাও।" });
    }

    try {
      setLoading(true);
      setMsg({ type: "", text: "" });

      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // backend returns: { token, user }
      setAuth({ token: data.token, user: data.user });

      const role = String(data?.user?.role || "user").toLowerCase();
      const userName = data?.user?.name || data?.user?.email || "User";

      // Initialize Tawk.to with user info
      initializeTawk(data.user);

      showLoginSuccess(userName);

      // Show offer modal after successful login
      setShowOfferModal(true);

      setTimeout(() => {
        if (role === "admin") navigate("/admindashboard");
        else if (role === "staff") navigate("/staff/dashboard");
        else navigate("/profile");
      }, 2000); // Increased delay to allow viewing offers
    } catch (err) {
      showError(err?.message || "Login failed");
      setMsg({ type: "err", text: err?.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Top Bar */}
      <div className="w-full bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center font-extrabold">
              F
            </div>
            <span className="font-bold tracking-wide">FoodBaZZ</span>
          </Link>

          <Link
            to="/register"
            className="text-sm font-semibold px-4 py-2 rounded-full border border-orange-500 hover:bg-orange-500 hover:text-white transition"
          >
            Register
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8 items-stretch">
        {/* Left promo */}
        <div className="rounded-2xl bg-gradient-to-br from-black to-orange-500 text-white p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Welcome Back 🍕
            </h1>
            <p className="mt-3 text-white/90">
              Login to continue ordering and exploring recipes.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="bg-white/10 rounded-xl p-4 border border-white/15">
                <p className="font-semibold">Quick Checkout</p>
                <p className="text-white/80 mt-1">Cart saved for you</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/15">
                <p className="font-semibold">Order Receipt</p>
                <p className="text-white/80 mt-1">Print anytime</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-xs text-white/70">
            Production auth: JWT + bcrypt (backend).
          </p>
        </div>

        {/* Right form */}
        <div className="rounded-2xl border border-orange-200 shadow-xl p-6 md:p-8 bg-white">
          <h2 className="text-2xl font-extrabold text-orange-600">Login</h2>
          <p className="text-sm text-gray-600 mt-1">
            Use your email and password.
          </p>

          {msg.text && (
            <div
              className={`mt-4 px-4 py-3 rounded-xl text-sm font-semibold border ${
                msg.type === "ok"
                  ? "bg-orange-50 text-orange-700 border-orange-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@email.com"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {!!form.email && !emailOk && (
                <p className="text-xs text-red-600 mt-1">
                  সঠিক ইমেইল ফরম্যাট লাগবে।
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold">Password</label>
              <div className="mt-2 flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500">
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="Your password"
                  className="w-full px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-extrabold py-3 rounded-xl transition shadow-md"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link
                to="/register"
                className="font-bold text-orange-600 hover:underline"
              >
                Create new account
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMsg({
                    type: "err",
                    text: "Forgot Password: backend হলে reset flow add করবে।",
                  })
                }
                className="text-gray-700 hover:text-black hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="mt-6 text-xs text-gray-500 text-center">
            JWT token saved in localStorage (roms_token, roms_user).
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      <OfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
      />
    </div>
  );
}
