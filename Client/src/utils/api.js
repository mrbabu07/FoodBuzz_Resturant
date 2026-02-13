//path: backend_sara/project/src/utils/api.js

// API Base URL - uses environment variable in production, proxy in development
const API_BASE = import.meta.env.VITE_API_URL || ""; // Empty string for Vite proxy
const TOKEN_KEY = "roms_token";

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const token = localStorage.getItem(TOKEN_KEY) || "";

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });

    // Check if response is JSON
    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!isJson) {
      // If not JSON, likely an error page (HTML)
      const text = await res.text();
      console.error("Non-JSON response received:", text.substring(0, 200));
      throw new Error(
        `Server returned non-JSON response (${res.status}). Check if backend is running.`,
      );
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || `Request failed (${res.status})`);
    }

    return data;
  } catch (error) {
    // If it's already our custom error, rethrow it
    if (
      error.message.includes("non-JSON") ||
      error.message.includes("Request failed")
    ) {
      throw error;
    }
    // Otherwise, it's a network or parsing error
    throw new Error(
      `API Error: ${error.message}. Check if backend is accessible.`,
    );
  }
}

// Helper to get the API base URL
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || window.location.origin;
};
