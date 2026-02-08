// path: backend_sara/project/src/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const user =
    JSON.parse(localStorage.getItem("roms_user") || "null") ||
    JSON.parse(localStorage.getItem("roms_current_user") || "null");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
