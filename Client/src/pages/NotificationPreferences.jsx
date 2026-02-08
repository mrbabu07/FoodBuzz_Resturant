import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
} from "../utils/pushNotifications";

/**
 * NotificationPreferences.jsx
 * Route: /notification-preferences
 *
 * Storage:
 * - roms_current_user: { fullName, email, phone? }
 * - roms_notification_prefs: {
 *    [userEmail]: {
 *      email: { verified, enabled, orderUpdates, promo, security },
 *      phone: { number, verified, enabled, orderUpdates, promo, security }
 *    }
 * }
 */

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

function maskPhone(p = "") {
  const s = String(p || "");
  if (s.length < 6) return s;
  return s.slice(0, 3) + "****" + s.slice(-3);
}

export default function NotificationPreferences() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);

  // Verification (demo OTP)
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const DEMO_OTP = "123456";

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState("default");
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const [prefs, setPrefs] = useState({
    email: {
      verified: false,
      enabled: true,
      orderUpdates: true,
      promo: false,
      security: true,
    },
    phone: {
      number: "",
      verified: false,
      enabled: false,
      orderUpdates: true,
      promo: false,
      security: true,
    },
    push: {
      enabled: false,
      orderUpdates: true,
      promo: false,
      newRecipes: true,
    },
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("roms_current_user") || "null");
    if (!u) return navigate("/login", { replace: true });
    setMe(u);

    const store = JSON.parse(
      localStorage.getItem("roms_notification_prefs") || "{}",
    );
    const key = (u.email || "").toLowerCase();

    const existing = store?.[key];
    if (existing) {
      setPrefs(existing);
    } else {
      // seed with user phone if exists
      setPrefs((p) => ({
        ...p,
        phone: { ...p.phone, number: u.phone || "" },
      }));
    }

    // Check push notification support and status
    setPushSupported(isPushSupported());
    setPushPermission(getNotificationPermission());

    // Check if subscribed
    isPushSubscribed().then((subscribed) => {
      setPushSubscribed(subscribed);
      setPrefs((p) => ({
        ...p,
        push: { ...p.push, enabled: subscribed },
      }));
    });
  }, [navigate]);

  const canEnableEmail = useMemo(
    () => prefs.email.verified,
    [prefs.email.verified],
  );
  const canEnablePhone = useMemo(
    () => prefs.phone.verified && !!prefs.phone.number,
    [prefs.phone.verified, prefs.phone.number],
  );

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const savePrefs = async () => {
    if (!me?.email) return;

    setSaving(true);
    try {
      const store = JSON.parse(
        localStorage.getItem("roms_notification_prefs") || "{}",
      );
      store[(me.email || "").toLowerCase()] = prefs;
      localStorage.setItem("roms_notification_prefs", JSON.stringify(store));
      showToast("Saved successfully ✅");
    } catch (e) {
      showToast("Save failed ❌");
    } finally {
      setSaving(false);
    }
  };

  const sendEmailOtp = () => {
    if (!me?.email) return;
    setEmailOtpSent(true);
    showToast(`Demo OTP sent to email (use ${DEMO_OTP})`);
  };

  const verifyEmailOtp = () => {
    if (emailOtp.trim() !== DEMO_OTP)
      return showToast("Wrong OTP ❌ (use 123456)");
    setPrefs((p) => ({
      ...p,
      email: { ...p.email, verified: true, enabled: true },
    }));
    setEmailOtp("");
    showToast("Email verified ✅");
  };

  const sendPhoneOtp = () => {
    if (!prefs.phone.number) return showToast("Add phone number first");
    setPhoneOtpSent(true);
    showToast(`Demo OTP sent to phone (use ${DEMO_OTP})`);
  };

  const verifyPhoneOtp = () => {
    if (phoneOtp.trim() !== DEMO_OTP)
      return showToast("Wrong OTP ❌ (use 123456)");
    setPrefs((p) => ({
      ...p,
      phone: { ...p.phone, verified: true, enabled: true },
    }));
    setPhoneOtp("");
    showToast("Phone verified ✅");
  };

  const handlePushToggle = async (enabled) => {
    if (!pushSupported) {
      showToast("Push notifications not supported in this browser");
      return;
    }

    setPushLoading(true);
    try {
      if (enabled) {
        // Subscribe to push
        await subscribeToPush();
        setPushSubscribed(true);
        setPushPermission("granted");
        setPrefs((p) => ({ ...p, push: { ...p.push, enabled: true } }));
        showToast("Push notifications enabled ✅");
      } else {
        // Unsubscribe from push
        await unsubscribeFromPush();
        setPushSubscribed(false);
        setPrefs((p) => ({ ...p, push: { ...p.push, enabled: false } }));
        showToast("Push notifications disabled");
      }
    } catch (error) {
      console.error("Push toggle error:", error);
      showToast("Failed to update push notifications ❌");
    } finally {
      setPushLoading(false);
    }
  };

  const Toggle = ({ checked, disabled, onChange }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`w-14 h-8 rounded-full border transition relative ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? "bg-orange-500 border-orange-500" : "bg-white border-gray-300"}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 left-1 w-6 h-6 rounded-full transition ${
          checked ? "translate-x-6 bg-white" : "translate-x-0 bg-black"
        }`}
      />
    </button>
  );

  if (!me) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-full bg-black text-white border border-orange-500/40 shadow-lg text-sm font-semibold">
            {toast}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.45 }}
          className="rounded-3xl bg-black text-white p-6 md:p-7 border border-orange-500/30 shadow-xl relative overflow-hidden"
        >
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-orange-500/20 blur-3xl rounded-full" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 w-96 h-96 bg-white/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-orange-300 text-sm font-semibold">
                Notification Preferences
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                Control Alerts & Updates 🔔
              </h1>
              <p className="text-white/80 mt-2">
                Verify email/phone and choose what you want to receive.
              </p>
              <p className="text-xs text-white/60 mt-3">
                Logged as:{" "}
                <span className="text-orange-300 font-bold">
                  {me.fullName || "User"} • {me.email}
                </span>
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link
                to="/profile"
                className="px-4 py-2 rounded-full border border-orange-500 text-orange-200 hover:bg-orange-500 hover:text-white transition font-semibold"
              >
                Dashboard
              </Link>
              <Link
                to="/manage"
                className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 transition font-extrabold"
              >
                Manage Profile
              </Link>
            </div>
          </div>

          <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-orange-500 via-white/10 to-orange-500 opacity-90" />
        </motion.div>

        {/* Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Email */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.45, delay: 0.08 }}
            className="rounded-3xl border border-orange-200 bg-white shadow p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-orange-600">
                  Email Alerts
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Email:{" "}
                  <span className="font-bold text-black">{me.email}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    prefs.email.verified
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-orange-50 text-orange-700 border border-orange-200"
                  }`}
                >
                  {prefs.email.verified ? "Verified" : "Not verified"}
                </span>

                <Toggle
                  checked={prefs.email.enabled}
                  disabled={!canEnableEmail}
                  onChange={(v) =>
                    setPrefs((p) => ({
                      ...p,
                      email: { ...p.email, enabled: v },
                    }))
                  }
                />
              </div>
            </div>

            {/* Verify */}
            {!prefs.email.verified && (
              <div className="mt-5 rounded-2xl bg-orange-50 border border-orange-200 p-4">
                <p className="text-sm font-bold text-black">
                  Verify your email
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Demo verification: click “Send OTP” then use <b>123456</b>.
                </p>

                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={sendEmailOtp}
                    className="px-4 py-2 rounded-xl bg-black text-white font-extrabold hover:bg-orange-500 transition"
                  >
                    Send OTP
                  </button>

                  {emailOtpSent && (
                    <>
                      <input
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="Enter OTP (123456)"
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={verifyEmailOtp}
                        className="px-4 py-2 rounded-xl bg-orange-500 text-white font-extrabold hover:bg-orange-600 transition"
                      >
                        Verify
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Preferences */}
            <div className="mt-5 space-y-3">
              {[
                {
                  key: "orderUpdates",
                  title: "Order updates",
                  desc: "Placed → Ready → Delivered status alerts",
                },
                {
                  key: "promo",
                  title: "Promotions",
                  desc: "Discounts, special offers, new menus",
                },
                {
                  key: "security",
                  title: "Security",
                  desc: "Login alerts, password changes",
                },
              ].map((x) => (
                <div
                  key={x.key}
                  className="rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-extrabold text-black">{x.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{x.desc}</p>
                  </div>
                  <Toggle
                    checked={prefs.email[x.key]}
                    disabled={!prefs.email.verified}
                    onChange={(v) =>
                      setPrefs((p) => ({
                        ...p,
                        email: { ...p.email, [x.key]: v },
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="h-1 mt-6 rounded-full bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-80" />
          </motion.div>

          {/* Phone */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.45, delay: 0.12 }}
            className="rounded-3xl border border-orange-200 bg-white shadow p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-orange-600">
                  SMS / Phone Alerts
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Number:{" "}
                  <span className="font-bold text-black">
                    {prefs.phone.number
                      ? maskPhone(prefs.phone.number)
                      : "Not set"}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    prefs.phone.verified
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-orange-50 text-orange-700 border border-orange-200"
                  }`}
                >
                  {prefs.phone.verified ? "Verified" : "Not verified"}
                </span>

                <Toggle
                  checked={prefs.phone.enabled}
                  disabled={!canEnablePhone}
                  onChange={(v) =>
                    setPrefs((p) => ({
                      ...p,
                      phone: { ...p.phone, enabled: v },
                    }))
                  }
                />
              </div>
            </div>

            {/* Phone input */}
            <div className="mt-5 rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-extrabold text-black">Phone Number</p>
              <p className="text-xs text-gray-600 mt-1">
                Add your phone then verify OTP (demo: <b>123456</b>)
              </p>

              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <input
                  value={prefs.phone.number}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      phone: {
                        ...p.phone,
                        number: e.target.value,
                        verified: false,
                        enabled: false,
                      },
                    }))
                  }
                  placeholder="e.g. 017XXXXXXXX"
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <button
                  onClick={sendPhoneOtp}
                  className="px-4 py-2 rounded-xl bg-black text-white font-extrabold hover:bg-orange-500 transition"
                >
                  Send OTP
                </button>
              </div>

              {phoneOtpSent && !prefs.phone.verified && (
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <input
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter OTP (123456)"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={verifyPhoneOtp}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white font-extrabold hover:bg-orange-600 transition"
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="mt-5 space-y-3">
              {[
                {
                  key: "orderUpdates",
                  title: "Order updates",
                  desc: "Status alerts by SMS",
                },
                {
                  key: "promo",
                  title: "Promotions",
                  desc: "Deals, coupons, hot offers",
                },
                {
                  key: "security",
                  title: "Security",
                  desc: "Security alerts by SMS",
                },
              ].map((x) => (
                <div
                  key={x.key}
                  className="rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-extrabold text-black">{x.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{x.desc}</p>
                  </div>
                  <Toggle
                    checked={prefs.phone[x.key]}
                    disabled={!prefs.phone.verified}
                    onChange={(v) =>
                      setPrefs((p) => ({
                        ...p,
                        phone: { ...p.phone, [x.key]: v },
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="h-1 mt-6 rounded-full bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-80" />
          </motion.div>

          {/* Push Notifications */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.45, delay: 0.16 }}
            className="rounded-3xl border border-orange-200 bg-white shadow p-6 lg:col-span-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-orange-600">
                  🔔 Push Notifications
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Get instant browser notifications for order updates and more
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!pushSupported ? (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gray-100 text-gray-700 border border-gray-200">
                    Not Supported
                  </span>
                ) : pushPermission === "denied" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700 border border-red-200">
                    Blocked
                  </span>
                ) : pushSubscribed ? (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-green-100 text-green-700 border border-green-200">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orange-50 text-orange-700 border border-orange-200">
                    Inactive
                  </span>
                )}

                <Toggle
                  checked={prefs.push.enabled}
                  disabled={
                    !pushSupported || pushPermission === "denied" || pushLoading
                  }
                  onChange={handlePushToggle}
                />
              </div>
            </div>

            {/* Info */}
            {!pushSupported && (
              <div className="mt-5 rounded-2xl bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm font-bold text-black">
                  Browser Not Supported
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Your browser doesn't support push notifications. Try using
                  Chrome, Firefox, or Edge.
                </p>
              </div>
            )}

            {pushSupported && pushPermission === "denied" && (
              <div className="mt-5 rounded-2xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-bold text-black">
                  Permission Blocked
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  You've blocked notifications. To enable them, click the lock
                  icon in your browser's address bar and allow notifications.
                </p>
              </div>
            )}

            {pushSupported && pushPermission !== "denied" && (
              <>
                {/* Preferences */}
                <div className="mt-5 grid md:grid-cols-3 gap-3">
                  {[
                    {
                      key: "orderUpdates",
                      title: "Order Updates",
                      desc: "Real-time order status changes",
                      icon: "📦",
                    },
                    {
                      key: "promo",
                      title: "Promotions",
                      desc: "Special offers and discounts",
                      icon: "🎁",
                    },
                    {
                      key: "newRecipes",
                      title: "New Recipes",
                      desc: "Latest recipe additions",
                      icon: "🍽️",
                    },
                  ].map((x) => (
                    <div
                      key={x.key}
                      className="rounded-2xl border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{x.icon}</span>
                        <Toggle
                          checked={prefs.push[x.key]}
                          disabled={!prefs.push.enabled}
                          onChange={(v) =>
                            setPrefs((p) => ({
                              ...p,
                              push: { ...p.push, [x.key]: v },
                            }))
                          }
                        />
                      </div>
                      <p className="font-extrabold text-black text-sm">
                        {x.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{x.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Test notification */}
                {prefs.push.enabled && (
                  <div className="mt-5 rounded-2xl bg-orange-50 border border-orange-200 p-4">
                    <p className="text-sm font-bold text-black">
                      Test Notification
                    </p>
                    <p className="text-xs text-gray-600 mt-1 mb-3">
                      Send a test notification to make sure everything works.
                    </p>
                    <button
                      onClick={async () => {
                        const { showLocalNotification } =
                          await import("../utils/pushNotifications");
                        await showLocalNotification("Test Notification", {
                          body: "Push notifications are working! 🎉",
                          tag: "test",
                        });
                        showToast("Test notification sent!");
                      }}
                      className="px-4 py-2 rounded-xl bg-orange-500 text-white font-extrabold hover:bg-orange-600 transition"
                    >
                      Send Test
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="h-1 mt-6 rounded-full bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-80" />
          </motion.div>
        </div>

        {/* Save bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.45, delay: 0.18 }}
          className="mt-6 rounded-3xl border border-orange-200 bg-white shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        >
          <div>
            <p className="font-extrabold text-black">Save changes</p>
            <p className="text-xs text-gray-600 mt-1">
              Demo storage: localStorage (later backend API).
            </p>
          </div>

          <button
            onClick={savePrefs}
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
