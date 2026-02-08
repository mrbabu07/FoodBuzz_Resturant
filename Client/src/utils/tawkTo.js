// Tawk.to Chat Widget Utility
// Customize chat widget with user information

/**
 * Wait for Tawk.to to be ready
 */
const waitForTawk = (callback, maxAttempts = 20) => {
  let attempts = 0;

  const checkTawk = () => {
    attempts++;

    if (typeof window.Tawk_API !== "undefined" && window.Tawk_API.onLoad) {
      // Tawk is loaded and ready
      callback();
    } else if (attempts < maxAttempts) {
      // Try again after 500ms
      setTimeout(checkTawk, 500);
    } else {
      console.warn("Tawk.to failed to load after", maxAttempts, "attempts");
    }
  };

  checkTawk();
};

/**
 * Set user information in Tawk.to chat
 * Call this after user logs in
 */
export const setTawkUser = (user) => {
  waitForTawk(() => {
    if (window.Tawk_API && window.Tawk_API.setAttributes) {
      window.Tawk_API.setAttributes(
        {
          name: user.name || user.email || "Guest",
          email: user.email || "",
          hash: user.id || user._id || "",
        },
        function (error) {
          if (error) {
            console.error("Tawk.to setAttributes error:", error);
          } else {
            console.log("Tawk.to user set:", user.name || user.email);
          }
        },
      );
    }
  });
};

/**
 * Show chat widget
 */
export const showTawkChat = () => {
  waitForTawk(() => {
    if (window.Tawk_API && window.Tawk_API.showWidget) {
      window.Tawk_API.showWidget();
    }
  });
};

/**
 * Hide chat widget
 */
export const hideTawkChat = () => {
  waitForTawk(() => {
    if (window.Tawk_API && window.Tawk_API.hideWidget) {
      window.Tawk_API.hideWidget();
    }
  });
};

/**
 * Maximize chat window (open chat)
 */
export const openTawkChat = () => {
  waitForTawk(() => {
    if (window.Tawk_API && window.Tawk_API.maximize) {
      window.Tawk_API.maximize();
    }
  });
};

/**
 * Minimize chat window (close chat)
 */
export const closeTawkChat = () => {
  waitForTawk(() => {
    if (window.Tawk_API && window.Tawk_API.minimize) {
      window.Tawk_API.minimize();
    }
  });
};

/**
 * Add custom tags to user
 */
export const addTawkTags = (tags = []) => {
  waitForTawk(() => {
    if (window.Tawk_API && window.Tawk_API.addTags) {
      window.Tawk_API.addTags(tags, function (error) {
        if (error) {
          console.error("Tawk.to tags error:", error);
        }
      });
    }
  });
};

/**
 * Add event to track user actions
 */
export const addTawkEvent = (eventName, metadata = {}) => {
  waitForTawk(() => {
    if (window.Tawk_API && window.Tawk_API.addEvent) {
      window.Tawk_API.addEvent(eventName, metadata, function (error) {
        if (error) {
          console.error("Tawk.to event error:", error);
        }
      });
    }
  });
};

/**
 * Initialize Tawk.to with user info when ready
 */
export const initializeTawk = (user) => {
  if (!user) return;

  waitForTawk(() => {
    // Set user information
    if (window.Tawk_API && window.Tawk_API.setAttributes) {
      window.Tawk_API.setAttributes(
        {
          name: user.name || user.email || "Guest",
          email: user.email || "",
          hash: user.id || user._id || "",
        },
        function (error) {
          if (error) {
            console.error("Tawk.to initialization error:", error);
          } else {
            console.log(
              "✅ Tawk.to initialized with user:",
              user.name || user.email,
            );

            // Add user role tag after successful initialization
            if (user.role && window.Tawk_API.addTags) {
              window.Tawk_API.addTags([user.role], function (tagError) {
                if (tagError) {
                  console.error("Tawk.to tag error:", tagError);
                } else {
                  console.log("✅ Tawk.to tag added:", user.role);
                }
              });
            }
          }
        },
      );
    }
  });
};

/**
 * Track important events
 */
export const trackOrderPlaced = (orderId, total) => {
  addTawkEvent("Order Placed", {
    orderId,
    total,
    timestamp: new Date().toISOString(),
  });
};

export const trackCartAbandoned = (cartTotal, itemCount) => {
  addTawkEvent("Cart Abandoned", {
    cartTotal,
    itemCount,
    timestamp: new Date().toISOString(),
  });
};

export const trackPageView = (pageName) => {
  addTawkEvent("Page View", {
    page: pageName,
    timestamp: new Date().toISOString(),
  });
};

export default {
  setTawkUser,
  showTawkChat,
  hideTawkChat,
  openTawkChat,
  closeTawkChat,
  addTawkTags,
  addTawkEvent,
  initializeTawk,
  trackOrderPlaced,
  trackCartAbandoned,
  trackPageView,
};
