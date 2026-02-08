import React from "react";
import { Outlet } from "react-router-dom";
import StaffNavbar from "../components/StaffNavbar";

export default function StaffLayout() {
  return (
    <div className="min-h-screen bg-white">
      <StaffNavbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </div>
    </div>
  );
}
