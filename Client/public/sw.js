// Service Worker for Push Notifications
// File: public/sw.js

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  let notificationData = {
    title: "FoodBuzz Notification",
    body: "You have a new notification",
    icon: "/favicon.jpg",
    badge: "/favicon.jpg",
    tag: "foodbuzz-notification",
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        data: data.data || {},
        actions: data.actions || [],
        requireInteraction: data.requireInteraction || false,
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      vibrate: [200, 100, 200],
    }),
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  // Handle action buttons
  if (event.action) {
    console.log("Action clicked:", event.action);

    if (event.action === "view-order") {
      event.waitUntil(clients.openWindow("/order_tracking"));
      return;
    }

    if (event.action === "view-menu") {
      event.waitUntil(clients.openWindow("/order_1st"));
      return;
    }
  }

  // Default action - open app
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window if app is not open
        if (clients.openWindow) {
          const url = event.notification.data?.url || "/";
          return clients.openWindow(url);
        }
      }),
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event);
});
