import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function StaffNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [me, setMe] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("roms_current_user") || "null");
    setMe(u);
  }, [location]);

  const logout = () => {
    localStorage.removeItem("roms_current_user");
    navigate("/login");
  };

  const active = (path) =>
    location.pathname === path
      ? "bg-orange-500 text-white"
      : "text-orange-700 hover:bg-orange-50";

  return (
    <div className="w-full bg-white border-b border-orange-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-extrabold">
            S
          </div>
          <div>
            <p className="text-orange-600 font-extrabold leading-none">FoodBaZZ</p>
            <p className="text-xs text-gray-500 -mt-0.5">Staff Panel</p>
          </div>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/staff/dashboard"
            className={`px-4 py-2 rounded-full font-bold transition ${active(
              "/staff/dashboard"
            )}`}
          >
            Dashboard
          </Link>

          <Link
            to="/staff/user-control"
            className={`px-4 py-2 rounded-full font-bold transition ${active(
              "/staff/user-control"
            )}`}
          >
            User Control
          </Link>

          <Link
            to="/staff/orders"
            className={`px-4 py-2 rounded-full font-bold transition ${active(
              "/staff/orders"
            )}`}
          >
            Orders
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-extrabold text-black">
              {me?.fullName || "Staff"}
            </p>
            <p className="text-xs text-gray-500">role: staff</p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-full bg-black text-white font-extrabold hover:bg-orange-500 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* mobile links */}
      <div className="md:hidden px-4 pb-3 flex gap-2 overflow-x-auto">
        <Link
          to="/staff/dashboard"
          className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${active(
            "/staff/dashboard"
          )}`}
        >
          Dashboard
        </Link>
        <Link
          to="/staff/user-control"
          className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${active(
            "/staff/user-control"
          )}`}
        >
          User Control
        </Link>
        <Link
          to="/staff/orders"
          className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${active(
            "/staff/orders"
          )}`}
        >
          Orders
        </Link>
      </div>

      <div className="h-1 bg-gradient-to-r from-orange-500 via-black to-orange-500 opacity-90" />
    </div>
  );
}
