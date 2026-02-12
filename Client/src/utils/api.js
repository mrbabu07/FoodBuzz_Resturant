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

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok)
    throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}

// Helper to get the API base URL
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || window.location.origin;
};
