//path: backend_sara/project/src/utils/api.js
const API_BASE = ""; // Use Vite proxy - empty string for relative URLs
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
