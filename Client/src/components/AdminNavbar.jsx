import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUtensils,
  FaShoppingCart,
  FaBookOpen,
  FaChartBar,
  FaUserFriends,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaGift,
  FaUsers,
  FaUserTie,
  FaTable,
  FaHome,
} from "react-icons/fa";

/* ✅ Admin Sidebar Items - Organized by Category */
const navSections = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        to: "/admindashboard",
        icon: <FaTachometerAlt />,
        color: "text-blue-500",
      },
    ],
  },
  {
    title: "Content Management",
    items: [
      {
        name: "Menu Items",
        to: "/managemenuadmin",
        icon: <FaUtensils />,
        color: "text-orange-500",
      },
      {
        name: "Recipes",
        to: "/managerecipesadmin",
        icon: <FaBookOpen />,
        color: "text-green-500",
      },
      {
        name: "Offers",
        to: "/manageoffers",
        icon: <FaGift />,
        color: "text-purple-500",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        name: "Orders",
        to: "/manageordersadmin",
        icon: <FaShoppingCart />,
        color: "text-red-500",
      },
      {
        name: "Reports",
        to: "/report",
        icon: <FaChartBar />,
        color: "text-indigo-500",
      },
    ],
  },
  {
    title: "User Management",
    items: [
      {
        name: "Staff",
        to: "/managestaff",
        icon: <FaUserTie />,
        color: "text-teal-500",
      },
      {
        name: "Users",
        to: "/manageusers",
        icon: <FaUsers />,
        color: "text-pink-500",
      },
      {
        name: "Authors",
        to: "/authors",
        icon: <FaTable />,
        color: "text-gray-500",
      },
    ],
  },
];

const AdminNavbar = ({ navOpen: navOpenProp, setNavOpen: setNavOpenProp }) => {
  const [internalNavOpen, setInternalNavOpen] = useState(false);

  // Use props if provided, otherwise use internal state
  const navOpen = navOpenProp !== undefined ? navOpenProp : internalNavOpen;
  const setNavOpen = setNavOpenProp || setInternalNavOpen;

  const sidebarWidth = navOpen ? "18rem" : "4rem";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  // 🔒 Logout
  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("roms_token");
    localStorage.removeItem("roms_user");
    localStorage.removeItem("roms_current_user");
    navigate("/login");
  };

  // Check if current path is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* 📱 Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 flex items-center px-4 z-50 shadow-sm">
        <button
          onClick={toggleMobileNav}
          className="text-2xl text-orange-500 hover:text-orange-600 transition-colors"
        >
          {mobileNavOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className="ml-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FB</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">FoodBuzz Admin</h1>
        </div>
      </div>

      {/* 🖥️ Desktop Sidebar */}
      <div
        className="hidden md:flex fixed top-0 left-0 h-screen bg-white text-gray-900 border-r border-gray-200 flex-col transition-all duration-300 z-30 shadow-lg"
        style={{ width: sidebarWidth, minWidth: 64 }}
        onMouseEnter={() => setNavOpen(true)}
        onMouseLeave={() => setNavOpen(false)}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-gradient-to-r from-orange-500 to-amber-500">
          {navOpen ? (
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="font-bold text-sm">FB</span>
              </div>
              <span className="font-black text-lg">FoodBuzz Admin</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-white">
              <span className="font-bold text-sm">FB</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-grow overflow-y-auto py-4">
          {/* Quick Actions */}
          <div className="px-3 mb-4">
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
                navOpen ? "hover:bg-blue-50" : "hover:bg-blue-50"
              }`}
              title="Back to Website"
            >
              <span className="text-lg text-blue-500 group-hover:scale-110 transition-transform">
                <FaHome />
              </span>
              {navOpen && (
                <span className="text-sm font-semibold text-blue-600">
                  Back to Website
                </span>
              )}
            </Link>
          </div>

          {/* Navigation Sections */}
          {navSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6">
              {navOpen && (
                <div className="px-6 mb-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}

              <div className="space-y-1 px-3">
                {section.items.map(({ name, to, icon, color }) => (
                  <Link
                    key={name}
                    to={to}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive(to)
                        ? "bg-orange-50 border-r-4 border-orange-500 text-orange-600"
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    }`}
                    title={name}
                  >
                    <span
                      className={`text-lg ${isActive(to) ? "text-orange-500" : color} group-hover:scale-110 transition-transform`}
                    >
                      {icon}
                    </span>
                    {navOpen && (
                      <span
                        className={`font-semibold ${isActive(to) ? "text-orange-600" : "text-gray-700"}`}
                      >
                        {name}
                      </span>
                    )}

                    {/* Active indicator */}
                    {isActive(to) && !navOpen && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full"></div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group ${
              navOpen ? "" : "justify-center"
            }`}
            title="Logout"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">
              <FaSignOutAlt />
            </span>
            {navOpen && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Sidebar */}
      {mobileNavOpen && (
        <div className="md:hidden fixed top-16 left-0 w-80 h-full bg-white shadow-2xl z-40 flex flex-col overflow-y-auto">
          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-200">
            <Link
              to="/"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
            >
              <FaHome />
              <span className="font-semibold">Back to Website</span>
            </Link>
          </div>

          {/* Navigation Sections */}
          <div className="flex-grow p-4">
            {navSections.map((section, sectionIndex) => (
              <div key={section.title} className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  {section.title}
                </h3>

                <div className="space-y-1">
                  {section.items.map(({ name, to, icon, color }) => (
                    <Link
                      key={name}
                      to={to}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive(to)
                          ? "bg-orange-50 text-orange-600 border-l-4 border-orange-500"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span
                        className={`text-lg ${isActive(to) ? "text-orange-500" : color}`}
                      >
                        {icon}
                      </span>
                      <span className="font-semibold">{name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Footer */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => {
                handleLogout();
                setMobileNavOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
            >
              <FaSignOutAlt />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
    </>
  );
};

export default AdminNavbar;
