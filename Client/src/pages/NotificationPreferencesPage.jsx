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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            🔔 Notification Preferences
          </h1>
          <p className="text-gray-600">
            Manage how you receive notifications from FoodBuzz
          </p>
        </div>

        {/* Email Notifications */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📧 Email Notifications
          </h2>

          <div className="space-y-4">
            <PreferenceToggle
              label="Order Confirmations"
              description="Receive email when you place an order"
              checked={preferences.orderEmails}
              onChange={() => handleToggle("orderEmails")}
              icon="🛒"
            />

            <PreferenceToggle
              label="Order Status Updates"
              description="Get notified when your order status changes"
              checked={preferences.statusEmails}
              onChange={() => handleToggle("statusEmails")}
              icon="📦"
            />

            <PreferenceToggle
              label="Promotions & Offers"
              description="Receive special offers, discounts, and new recipes"
              checked={preferences.promoEmails}
              onChange={() => handleToggle("promoEmails")}
              icon="🎁"
            />
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🔔 Push Notifications
          </h2>

          <div className="mb-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Status:</strong>{" "}
              {pushPermission === "granted"
                ? "✅ Enabled"
                : pushPermission === "denied"
                  ? "❌ Blocked"
                  : "⚠️ Not enabled"}
            </p>
            {pushPermission === "denied" && (
              <p className="text-sm text-blue-800 mt-2">
                Push notifications are blocked. Please enable them in your
                browser settings.
              </p>
            )}
          </div>

          <PreferenceToggle
            label="Browser Push Notifications"
            description="Get instant notifications in your browser"
            checked={pushSubscribed}
            onChange={handlePushToggle}
            icon="🔔"
            disabled={pushPermission === "denied"}
          />

          {pushPermission === "default" && !pushSubscribed && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
              <p className="text-sm text-yellow-800">
                💡 Click the toggle above to enable push notifications. You'll
                be asked for permission.
              </p>
            </div>
          )}
        </div>

        {/* SMS Notifications */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📱 SMS Notifications
          </h2>

          <div className="mb-4 p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm text-yellow-800">
              ⚠️ SMS notifications are currently in development. This feature
              will be available soon.
            </p>
          </div>

          <PreferenceToggle
            label="SMS Alerts"
            description="Receive text messages for important order updates"
            checked={preferences.smsNotifications}
            onChange={() => handleToggle("smsNotifications")}
            icon="📱"
            disabled={true}
          />
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "💾 Save Preferences"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Your preferences are saved automatically and synced across all
            devices
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
      className={`flex items-start justify-between p-4 rounded-xl border-2 transition-all ${
        checked
          ? "border-orange-500 bg-orange-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-bold text-gray-900">{label}</h3>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
          checked ? "bg-orange-500" : "bg-gray-300"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
