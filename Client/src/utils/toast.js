// Toast notification utility using react-hot-toast
import toast from "react-hot-toast";

// Success toast
export const showSuccess = (message) => {
  return toast.success(message, {
    duration: 3000,
  });
};

// Error toast
export const showError = (message) => {
  return toast.error(message, {
    duration: 4000,
  });
};

// Loading toast
export const showLoading = (message = "Loading...") => {
  return toast.loading(message);
};

// Dismiss a specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Promise toast - shows loading, then success or error
export const showPromise = (promise, messages) => {
  return toast.promise(promise, {
    loading: messages.loading || "Loading...",
    success: messages.success || "Success!",
    error: messages.error || "Something went wrong",
  });
};

// Custom toast with icon
export const showCustom = (message, icon = "🔔") => {
  return toast(message, {
    icon: icon,
    duration: 3000,
  });
};

// Info toast (custom with blue theme)
export const showInfo = (message) => {
  return toast(message, {
    icon: "ℹ️",
    duration: 3000,
    style: {
      border: "2px solid #3b82f6",
    },
  });
};

// Warning toast (custom with yellow theme)
export const showWarning = (message) => {
  return toast(message, {
    icon: "⚠️",
    duration: 3500,
    style: {
      border: "2px solid #f59e0b",
    },
  });
};

// Cart action toasts
export const showCartAdded = (itemName) => {
  return toast.success(`${itemName} added to cart! 🛒`, {
    duration: 2500,
  });
};

export const showCartRemoved = (itemName) => {
  return toast(`${itemName} removed from cart`, {
    icon: "🗑️",
    duration: 2000,
  });
};

// Order toasts
export const showOrderPlaced = (orderId) => {
  return toast.success(`Order #${orderId} placed successfully! 🎉`, {
    duration: 4000,
  });
};

export const showOrderCancelled = () => {
  return toast.error("Order cancelled", {
    duration: 3000,
  });
};

// Favorite toasts
export const showFavoriteAdded = () => {
  return toast.success("Added to favorites! ❤️", {
    duration: 2500,
  });
};

export const showFavoriteRemoved = () => {
  return toast("Removed from favorites", {
    icon: "💔",
    duration: 2000,
  });
};

// Auth toasts
export const showLoginSuccess = (userName) => {
  return toast.success(`Welcome back, ${userName}! 👋`, {
    duration: 3000,
  });
};

export const showLogoutSuccess = () => {
  return toast.success("Logged out successfully", {
    duration: 2500,
  });
};

export const showRegistrationSuccess = () => {
  return toast.success("Account created successfully! 🎉", {
    duration: 3000,
  });
};

// Upload toasts
export const showUploadSuccess = () => {
  return toast.success("Upload successful! ✅", {
    duration: 2500,
  });
};

export const showUploadError = () => {
  return toast.error("Upload failed. Please try again.", {
    duration: 3000,
  });
};

// Delete confirmation toast
export const showDeleteSuccess = (itemName) => {
  return toast.success(`${itemName} deleted successfully`, {
    duration: 2500,
  });
};

// Update success toast
export const showUpdateSuccess = (itemName) => {
  return toast.success(`${itemName} updated successfully! ✅`, {
    duration: 2500,
  });
};

// Copy to clipboard toast
export const showCopied = () => {
  return toast.success("Copied to clipboard! 📋", {
    duration: 2000,
  });
};

// Network error toast
export const showNetworkError = () => {
  return toast.error("Network error. Please check your connection.", {
    duration: 4000,
  });
};

// Permission denied toast
export const showPermissionDenied = () => {
  return toast.error("Permission denied. Please login.", {
    duration: 3000,
  });
};

export default toast;
