//path: backend_sara/project/src/utils/authStorage.js
const TOKEN_KEY = "roms_token";
const USER_KEY = "roms_user";
const LEGACY_USER_KEY = "roms_current_user"; // ✅ App.jsx / StaffRoute compatibility

export function setAuth({ token, user }) {
  // token
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);

  // user (new)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);

  // ✅ legacy (old guards use this)
  if (user) localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(LEGACY_USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getUser() {
  try {
    // ✅ prefer new key, fallback legacy
    return (
      JSON.parse(localStorage.getItem(USER_KEY) || "null") ||
      JSON.parse(localStorage.getItem(LEGACY_USER_KEY) || "null")
    );
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function isLoggedIn() {
  return !!getToken() || !!getUser();
}

export function hasRole(roles = []) {
  const u = getUser();
  const role = String(u?.role || "").toLowerCase();
  return roles.map((r) => String(r).toLowerCase()).includes(role);
}
