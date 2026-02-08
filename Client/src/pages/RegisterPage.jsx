// Path: backend_sara/project/src/pages/RegisterPage.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { setAuth } from "../utils/authStorage";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const emailOk = useMemo(() => {
    const v = form.email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [form.email]);

  const passOk = useMemo(
    () => String(form.password || "").length >= 6,
    [form.password]
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setMsg({ type: "", text: "" });
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const address = form.address.trim();

    if (!name || !email || !password) {
      return setMsg({ type: "err", text: "Name, Email, Password লাগবে।" });
    }
    if (!emailOk) {
      return setMsg({ type: "err", text: "সঠিক ইমেইল দাও।" });
    }
    if (!passOk) {
      return setMsg({ type: "err", text: "Password কমপক্ষে 6 অক্ষর হতে হবে।" });
    }

    try {
      setLoading(true);
      setMsg({ type: "", text: "" });

      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, address }),
      });

      // ✅ save auth (token + user)
      setAuth({ token: data.token, user: data.user });

      const role = String(data?.user?.role || "user").toLowerCase();
      setMsg({ type: "ok", text: `✅ Registered! (${role.toUpperCase()})` });

      setTimeout(() => {
        if (role === "admin") navigate("/admindashboard");
        else if (role === "staff") navigate("/staff/dashboard");
        else navigate("/user/dashboard");
      }, 300);
    } catch (err) {
      setMsg({ type: "err", text: err?.message || "Registration failed" });
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
            to="/login"
            className="text-sm font-semibold px-4 py-2 rounded-full border border-orange-500 hover:bg-orange-500 hover:text-white transition"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8 items-stretch">
        {/* Left promo (same vibe as login) */}
        <div className="rounded-2xl bg-gradient-to-br from-black to-orange-500 text-white p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Create Account 🍔
            </h1>
            <p className="mt-3 text-white/90">
              Register to start ordering and tracking your food easily.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="bg-white/10 rounded-xl p-4 border border-white/15">
                <p className="font-semibold">Fast Ordering</p>
                <p className="text-white/80 mt-1">Save items to cart</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/15">
                <p className="font-semibold">Track Orders</p>
                <p className="text-white/80 mt-1">Realtime status updates</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-xs text-white/70">
            Registration creates user in MongoDB + returns JWT token.
          </p>
        </div>

        {/* Right form (same style as login) */}
        <div className="rounded-2xl border border-orange-200 shadow-xl p-6 md:p-8 bg-white">
          <h2 className="text-2xl font-extrabold text-orange-600">Register</h2>
          <p className="text-sm text-gray-600 mt-1">
            Use your details to create an account.
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
              <label className="text-sm font-semibold">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

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
                  placeholder="Min 6 characters"
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
              {!!form.password && !passOk && (
                <p className="text-xs text-red-600 mt-1">
                  Password কমপক্ষে 6 অক্ষর হতে হবে।
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold">Address (optional)</label>
              <input
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="Your address"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-extrabold py-3 rounded-xl transition shadow-md"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link to="/login" className="font-bold text-orange-600 hover:underline">
                Already have an account?
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMsg({
                    type: "err",
                    text: "Note: Admin/Staff create করবে admin panel বা script দিয়ে।",
                  })
                }
                className="text-gray-700 hover:text-black hover:underline"
              >
                Need admin?
              </button>
            </div>
          </form>

          <div className="mt-6 text-xs text-gray-500 text-center">
            JWT token saved in localStorage (roms_token, roms_user).
          </div>
        </div>
      </div>
    </div>
  );
}
