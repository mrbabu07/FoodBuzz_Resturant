import React from "react";
import { Navigate } from "react-router-dom";

export default function StaffRoute({ children }) {
  const me = JSON.parse(localStorage.getItem("roms_current_user") || "null");
  if (!me) return <Navigate to="/login" replace />;
  if (me.role === "staff") return children;
  return <Navigate to="/" replace />;
}
