// Notification Permission Banner Component
// File: src/components/NotificationPermission.jsx

import { useState, useEffect } from "react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
} from "../utils/pushNotifications";
import { showSuccess, showError } from "../utils/toast";

function NotificationPermission() {
  const [permission, setPermission] = useState("default");
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentPermission = getNotificationPermission();
    setPermission(currentPermission);

    // Show banner if permission is default (not asked yet)
    // and user hasn't dismissed it in this session
    const dismissed = sessionStorage.getItem("notification-banner-dismissed");
    if (currentPermission === "default" && !dismissed) {
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);

      if (result === "granted") {
        // Subscribe to push notifications
        await subscribeToPush();
        showSuccess("Notifications enabled! You'll receive order updates.");
        setShowBanner(false);
      } else {
        showError("Notification permission denied");
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      showError("Failed to enable notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("notification-banner-dismissed", "true");
  };

  // Don't show banner if permission already granted or denied
  if (!showBanner || permission !== "default") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
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
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Stay Updated!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Enable notifications to get real-time updates about your orders,
              new recipes, and special offers.
            </p>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleEnable}
                disabled={loading}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enabling..." : "Enable Notifications"}
              </button>
              <button
                onClick={handleDismiss}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationPermission;
