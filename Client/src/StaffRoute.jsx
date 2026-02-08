import React from "react";
import { Navigate } from "react-router-dom";

export default function StaffRoute({ children }) {
  const me = JSON.parse(localStorage.getItem("roms_current_user") || "null");

  if (!me) return <Navigate to="/login" replace />;

  // ✅ only staff can enter staff pages
  if (me.role === "staff") return children;

  // admin/user not allowed in staff panel
  return <Navigate to="/" replace />;
}
