// src/components/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  getMe,
  getMyNotifications,
  getUnreadCount,
  deleteNotification,
  markRead,
  markAllRead,
  seedDemoNotificationsIfEmpty,
} from "../utils/notifications";

export default function Navbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dropdownMobileOpen, setDropdownMobileOpen] = useState(false);
  const [dropdownDesktopOpen, setDropdownDesktopOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);

  // 🔔 localStorage based notifications
  const [notes, setNotes] = useState([]);
  const [unread, setUnread] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");

  const notificationRef = useRef(null);
  const accountRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ session
  const [me, setMe] = useState(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const refreshNotes = (user) => {
    const u = user || getMe();
    if (!u?.email) {
      setNotes([]);
      setUnread(0);
      return;
    }

    // demo seed (optional)
    seedDemoNotificationsIfEmpty(u.email);

    const list = getMyNotifications(u.email);
    setNotes(list);
    setUnread(getUnreadCount(u.email));
  };

  useEffect(() => {
    const u = getMe();
    setMe(u);
    refreshNotes(u);
  }, [location.pathname]);

  useEffect(() => {
    const onChange = () => refreshNotes();
    window.addEventListener("roms_notifications_changed", onChange);
    return () =>
      window.removeEventListener("roms_notifications_changed", onChange);
  }, []);

  // 🔄 Close panels on route change
  useEffect(() => {
    setShowNotifications(false);
    setDropdownDesktopOpen(false);
    setDropdownMobileOpen(false);
    setMobileNavOpen(false);
  }, [location.pathname]);

  // 🖱️ Close dropdown/panels on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setDropdownDesktopOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileNav = () => {
    setMobileNavOpen((prev) => !prev);
    if (mobileNavOpen) setDropdownMobileOpen(false);
  };

  const toggleDropdownMobile = () => setDropdownMobileOpen((prev) => !prev);
  const toggleDropdownDesktop = () => setDropdownDesktopOpen((prev) => !prev);
  const toggleNotifications = () => setShowNotifications((prev) => !prev);

  const handleDetails = (note) => {
    // open করলে read করে দেই
    markRead(note.id, true);
    refreshNotes(me);

    if (note.type === "popup") {
      setModalText(note.details || note.text);
      setShowModal(true);
    } else if (note.type === "tracking") {
      navigate("/order_tracking");
    }
  };

  const handleRemoveNotification = (id) => {
    deleteNotification(id);
    refreshNotes(me);
  };

  const goProtected = (path) => {
    const u = getMe();
    if (!u) return navigate("/login");
    navigate(path);
  };

  const logout = () => {
    localStorage.removeItem("roms_current_user");
    setDropdownDesktopOpen(false);
    setDropdownMobileOpen(false);
    setShowNotifications(false);
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-2xl border-b border-orange-100"
          : "bg-white/90 backdrop-blur-md shadow-lg"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <img
              src="/favicon.jpg"
              alt="Logo"
              className="h-10 w-10 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-orange-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="font-black text-2xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            FoodBuzz
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          {[
            { to: "/", label: "Home", icon: "🏠" },
            { to: "/recipe", label: "Recipes", icon: "📚" },
            { to: "/order_1st", label: "Order Now", icon: "🛒" },
            { to: "/about", label: "About", icon: "ℹ️" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                location.pathname === item.to
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {me && (
            <Link
              to="/favorites"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                location.pathname === "/favorites"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <span className="text-lg">❤️</span>
              Favorites
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 relative">
          {/* 🔔 Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              className="relative p-3 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-200"
              aria-label="Notifications"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1"
                />
              </svg>

              {unread > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-2 py-1 font-bold animate-pulse shadow-lg">
                  {unread}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 max-w-[90vw] bg-white border-2 border-orange-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-slide-down">
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black">🔔 Notifications</h3>
                      <p className="text-orange-100 text-sm">
                        Unread: <span className="font-bold">{unread}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (!me?.email) return;
                        markAllRead(me.email);
                        refreshNotes(me);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold hover:bg-white/30 transition-all"
                    >
                      Mark all read
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="max-h-[420px] overflow-auto">
                  {!me ? (
                    <div className="p-6 text-center">
                      <div className="text-4xl mb-3">🔐</div>
                      <p className="text-gray-600 mb-4">
                        Please login to see notifications
                      </p>
                      <Link
                        to="/login"
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
                      >
                        Login Now
                      </Link>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-6xl mb-4">🎉</div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        All caught up!
                      </h4>
                      <p className="text-gray-500">No new notifications</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-orange-100">
                      {notes.map((note) => (
                        <li
                          key={note.id}
                          className={`p-4 hover:bg-orange-50 transition-all ${
                            note.read ? "bg-white" : "bg-orange-50/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-gray-900 font-bold truncate">
                                {note.text}
                              </p>
                              {note.details && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {note.details}
                                </p>
                              )}

                              <div className="flex mt-3 gap-2 flex-wrap">
                                <button
                                  onClick={() => handleDetails(note)}
                                  className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-all font-bold"
                                >
                                  Open
                                </button>

                                <button
                                  onClick={() => {
                                    markRead(note.id, !note.read);
                                    refreshNotes(me);
                                  }}
                                  className="px-3 py-1 text-xs rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-all font-bold"
                                >
                                  {note.read ? "Mark unread" : "Mark read"}
                                </button>

                                <button
                                  onClick={() =>
                                    handleRemoveNotification(note.id)
                                  }
                                  className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-all font-bold"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {!note.read && (
                              <span className="mt-1 w-3 h-3 rounded-full bg-orange-500 flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-orange-100">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-full text-center text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 👤 Account (Desktop) */}
          <div className="hidden md:flex relative" ref={accountRef}>
            <button
              onClick={toggleDropdownDesktop}
              className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              <span>{me ? me.fullName || "Account" : "Account"}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z" />
              </svg>
            </button>

            {dropdownDesktopOpen && (
              <div className="absolute right-0 mt-16 w-64 bg-white border-2 border-orange-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
                <div className="p-2">
                  {!me ? (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all font-semibold"
                      >
                        <span className="text-lg">🔑</span>
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all font-semibold"
                      >
                        <span className="text-lg">📝</span>
                        Register
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => goProtected("/profile")}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all font-semibold"
                      >
                        <span className="text-lg">👤</span>
                        Profile
                      </button>
                      <button
                        onClick={() => goProtected("/manage")}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all font-semibold"
                      >
                        <span className="text-lg">⚙️</span>
                        Manage
                      </button>
                      <button
                        onClick={() => goProtected("/notification-preferences")}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all font-semibold"
                      >
                        <span className="text-lg">🔔</span>
                        Notifications
                      </button>

                      {me?.role === "staff" && (
                        <Link
                          to="/staff/dashboard"
                          className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all font-semibold"
                        >
                          <span className="text-lg">👨‍💼</span>
                          Staff Panel
                        </Link>
                      )}

                      <div className="border-t border-gray-200 my-2"></div>

                      <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-red-500"
                      >
                        <span className="text-lg">🚪</span>
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 🍔 Mobile Menu Button */}
          <button
            onClick={toggleMobileNav}
            className="md:hidden p-3 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 hover:scale-110 transition-all duration-300 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 📱 Mobile Menu */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-t-2 border-orange-100 shadow-2xl animate-slide-down">
          <div className="p-6 space-y-4">
            {[
              { to: "/", label: "Home", icon: "🏠" },
              { to: "/recipe", label: "Recipes", icon: "📚" },
              { to: "/order_1st", label: "Order Now", icon: "🛒" },
              { to: "/about", label: "About", icon: "ℹ️" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  location.pathname === item.to
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <button
              onClick={toggleDropdownMobile}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
            >
              <span className="text-lg">👤</span>
              Account
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 ml-auto transition-transform ${dropdownMobileOpen ? "rotate-180" : ""}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z" />
              </svg>
            </button>

            {dropdownMobileOpen && (
              <div className="bg-orange-50 rounded-2xl p-4 ml-4 space-y-2 animate-slide-down">
                {!me ? (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:text-orange-600 transition-all font-semibold"
                    >
                      <span className="text-lg">🔑</span>
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:text-orange-600 transition-all font-semibold"
                    >
                      <span className="text-lg">📝</span>
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => goProtected("/profile")}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-white hover:text-orange-600 transition-all font-semibold"
                    >
                      <span className="text-lg">👤</span>
                      Profile
                    </button>
                    <button
                      onClick={() => goProtected("/manage")}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-white hover:text-orange-600 transition-all font-semibold"
                    >
                      <span className="text-lg">⚙️</span>
                      Manage
                    </button>
                    <button
                      onClick={() => goProtected("/notification-preferences")}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-white hover:text-orange-600 transition-all font-semibold"
                    >
                      <span className="text-lg">🔔</span>
                      Notifications
                    </button>

                    {me?.role === "staff" && (
                      <Link
                        to="/staff/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:text-orange-600 transition-all font-semibold"
                      >
                        <span className="text-lg">👨‍💼</span>
                        Staff Panel
                      </Link>
                    )}

                    <div className="border-t border-orange-200 my-2"></div>

                    <button
                      onClick={logout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-xl hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-red-500"
                    >
                      <span className="text-lg">🚪</span>
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔳 Modal for Popup Notifications */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full mx-4 shadow-2xl border-2 border-orange-100 text-center animate-scale-in">
            <div className="text-4xl mb-4">📢</div>
            <h2 className="text-orange-600 font-black text-2xl mb-4">Notice</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">{modalText}</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 hover:scale-105 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
