import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../utils/notifications";
import {
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
  getNotificationPermission,
} from "../utils/pushNotifications";
import { showSuccess, showError } from "../utils/toast";

export default function NotificationPreferencesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    orderEmails: true,
    statusEmails: true,
    promoEmails: false,
    pushNotifications: false,
    smsNotifications: false,
    // Quiet Hours
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    quietHoursWeekendOnly: false,
    // Notification Frequency
    notificationFrequency: "instant",
    digestTime: "09:00",
    // Advanced Settings
    soundEnabled: true,
    vibrationEnabled: true,
    showPreview: true,
  });
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushPermission, setPushPermission] = useState("default");

  useEffect(() => {
    loadPreferences();
    checkPushStatus();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await getNotificationPreferences();
      setPreferences(data.notificationPrefs || preferences);
    } catch (error) {
      console.error("Failed to load preferences:", error);
      showError("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const checkPushStatus = async () => {
    const subscribed = await isPushSubscribed();
    const permission = getNotificationPermission();
    setPushSubscribed(subscribed);
    setPushPermission(permission);
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTimeChange = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFrequencyChange = (value) => {
    setPreferences((prev) => ({
      ...prev,
      notificationFrequency: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNotificationPreferences(preferences);
      showSuccess("Preferences saved successfully");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      showError("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async () => {
    try {
      if (pushSubscribed) {
        await unsubscribeFromPush();
        setPushSubscribed(false);
        setPreferences((prev) => ({ ...prev, pushNotifications: false }));
        showSuccess("Push notifications disabled");
      } else {
        await subscribeToPush();
        setPushSubscribed(true);
        setPreferences((prev) => ({ ...prev, pushNotifications: true }));
        showSuccess("Push notifications enabled");
      }
      await checkPushStatus();
    } catch (error) {
      console.error("Failed to toggle push notifications:", error);
      showError(error.message || "Failed to toggle push notifications");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 p-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
            </div>
            <p className="text-lg text-slate-600 font-medium">
              Loading your preferences...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-white/90 hover:text-white transition-colors group relative z-10"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold">Back</span>
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">
                  Notification Center
                </h1>
                <p className="text-purple-100 text-lg">
                  Customize how you stay informed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Notifications Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
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
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Email Notifications
              </h2>
              <p className="text-slate-500 text-sm">
                Receive updates via email
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <PreferenceToggle
              label="Order Confirmations"
              description="Get instant confirmation when you place an order"
              checked={preferences.orderEmails}
              onChange={() => handleToggle("orderEmails")}
              icon={
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              }
            />

            <PreferenceToggle
              label="Order Status Updates"
              description="Track your order from kitchen to doorstep"
              checked={preferences.statusEmails}
              onChange={() => handleToggle("statusEmails")}
              icon={
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />

            <PreferenceToggle
              label="Promotions & Special Offers"
              description="Be the first to know about exclusive deals and new recipes"
              checked={preferences.promoEmails}
              onChange={() => handleToggle("promoEmails")}
              icon={
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
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              }
            />
          </div>
        </div>

        {/* Push Notifications Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Push Notifications
              </h2>
              <p className="text-slate-500 text-sm">
                Instant alerts on your device
              </p>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  pushPermission === "granted"
                    ? "bg-green-500 animate-pulse"
                    : pushPermission === "denied"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              ></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">
                  Status:{" "}
                  {pushPermission === "granted"
                    ? "✅ Enabled"
                    : pushPermission === "denied"
                      ? "❌ Blocked"
                      : "⚠️ Not Configured"}
                </p>
                {pushPermission === "denied" && (
                  <p className="text-xs text-slate-600 mt-1">
                    Please enable notifications in your browser settings
                  </p>
                )}
              </div>
            </div>
          </div>

          <PreferenceToggle
            label="Browser Push Notifications"
            description="Get real-time updates even when the app is closed"
            checked={pushSubscribed}
            onChange={handlePushToggle}
            icon={
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            }
            disabled={pushPermission === "denied"}
          />

          {pushPermission === "default" && !pushSubscribed && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
              <div className="flex gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Quick Tip
                  </p>
                  <p className="text-xs text-amber-800 mt-1">
                    Toggle the switch above to enable push notifications. Your
                    browser will ask for permission.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SMS Notifications Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full -mr-16 -mt-16 opacity-50"></div>

          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                SMS Notifications
              </h2>
              <p className="text-slate-500 text-sm">Text message alerts</p>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 relative z-10">
            <div className="flex gap-3">
              <div className="text-2xl">🚀</div>
              <div>
                <p className="text-sm font-semibold text-purple-900">
                  Coming Soon
                </p>
                <p className="text-xs text-purple-800 mt-1">
                  SMS notifications are currently in development and will be
                  available soon!
                </p>
              </div>
            </div>
          </div>

          <PreferenceToggle
            label="SMS Alerts"
            description="Receive critical order updates via text message"
            checked={preferences.smsNotifications}
            onChange={() => handleToggle("smsNotifications")}
            icon={
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
            }
            disabled={true}
          />
        </div>

        {/* Quiet Hours Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Quiet Hours</h2>
              <p className="text-slate-500 text-sm">Do Not Disturb schedule</p>
            </div>
          </div>

          <div className="space-y-4">
            <PreferenceToggle
              label="Enable Quiet Hours"
              description="Pause non-urgent notifications during specific hours"
              checked={preferences.quietHoursEnabled}
              onChange={() => handleToggle("quietHoursEnabled")}
              icon={
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
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              }
            />

            {preferences.quietHoursEnabled && (
              <div className="ml-14 space-y-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={preferences.quietHoursStart}
                      onChange={(e) =>
                        handleTimeChange("quietHoursStart", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={preferences.quietHoursEnd}
                      onChange={(e) =>
                        handleTimeChange("quietHoursEnd", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </div>

                <PreferenceToggle
                  label="Weekends Only"
                  description="Apply quiet hours only on Saturday and Sunday"
                  checked={preferences.quietHoursWeekendOnly}
                  onChange={() => handleToggle("quietHoursWeekendOnly")}
                  icon={
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Notification Frequency Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Notification Frequency
              </h2>
              <p className="text-slate-500 text-sm">
                Control how often you receive notifications
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Delivery Schedule
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    value: "instant",
                    label: "Instant",
                    desc: "Receive notifications immediately",
                    icon: "⚡",
                  },
                  {
                    value: "hourly",
                    label: "Hourly Digest",
                    desc: "Batched every hour",
                    icon: "⏰",
                  },
                  {
                    value: "daily",
                    label: "Daily Digest",
                    desc: "Once per day summary",
                    icon: "📅",
                  },
                  {
                    value: "weekly",
                    label: "Weekly Digest",
                    desc: "Weekly summary",
                    icon: "📊",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFrequencyChange(option.value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      preferences.notificationFrequency === option.value
                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">
                          {option.label}
                        </div>
                        <div className="text-xs text-slate-600">
                          {option.desc}
                        </div>
                      </div>
                      {preferences.notificationFrequency === option.value && (
                        <svg
                          className="w-6 h-6 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {(preferences.notificationFrequency === "daily" ||
              preferences.notificationFrequency === "weekly") && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Digest Delivery Time
                </label>
                <input
                  type="time"
                  value={preferences.digestTime}
                  onChange={(e) =>
                    handleTimeChange("digestTime", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
                <p className="text-xs text-slate-600 mt-2">
                  {preferences.notificationFrequency === "daily"
                    ? "Receive your daily summary at this time"
                    : "Receive your weekly summary every Monday at this time"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Settings Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Advanced Settings
              </h2>
              <p className="text-slate-500 text-sm">
                Fine-tune your notification experience
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <PreferenceToggle
              label="Notification Sound"
              description="Play a sound when notifications arrive"
              checked={preferences.soundEnabled}
              onChange={() => handleToggle("soundEnabled")}
              icon={
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
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              }
            />

            <PreferenceToggle
              label="Vibration"
              description="Vibrate device when notifications arrive (mobile only)"
              checked={preferences.vibrationEnabled}
              onChange={() => handleToggle("vibrationEnabled")}
              icon={
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
                    d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              }
            />

            <PreferenceToggle
              label="Show Preview"
              description="Display notification content in preview"
              checked={preferences.showPreview}
              onChange={() => handleToggle("showPreview")}
              icon={
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              }
            />
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-8 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/notification-history")}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 text-left group"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <div className="font-semibold">Notification History</div>
                  <div className="text-xs text-slate-300">
                    View past notifications
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/notification-analytics")}
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 text-left group"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <div>
                  <div className="font-semibold">Analytics Dashboard</div>
                  <div className="text-xs text-slate-300">
                    View engagement stats
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Save Button Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8 hover:shadow-2xl transition-all duration-300">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold py-5 px-8 rounded-2xl hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg">Saving...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 transform group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-lg">Save Preferences</span>
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4 flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Your preferences are encrypted and synced across all devices
          </p>
        </div>
      </div>
    </div>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  icon,
  disabled = false,
}) {
  return (
    <div
      className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${
        checked
          ? "border-purple-400 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={disabled ? undefined : onChange}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              checked
                ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg"
                : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 mb-1 text-lg">{label}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 flex-shrink-0 ${
            checked
              ? "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg"
              : "bg-slate-300"
          } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 shadow-md ${
              checked ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
