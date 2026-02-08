//path: backend_sara/project/src/App.jsx
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import PrivateRoute from "./PrivateRoute";
import { initializeTawk } from "./utils/tawkTo";
import { initializePushNotifications } from "./utils/pushNotifications";
import NotificationPermission from "./components/NotificationPermission";

// Common UI
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./context/ScrollToTop";

// Static pages
import TermsAndConditions from "./components/TermsAndConditions";
import PrivacyPolicy from "./components/PrivacyPolicy";
import About from "./pages/about";

// Auth pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// User pages
import Home from "./pages/Home";
import Recipe_1st_page from "./pages/Recipe_1st_page";
import CategoryPage from "./pages/CategoryPage";
import UserDashboard from "./pages/UserDashboard";
import ManageProfile from "./pages/ManageProfile";
import Order_1st_Page from "./pages/order_1st_page";
import MenuCategoryPage from "./pages/MenuCategoryPage";
import MenuDetailsPage from "./pages/MenuDetailsPage";
import CartPage from "./pages/CartPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import ReceiptPage from "./pages/ReceiptPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import NotificationPreferences from "./pages/NotificationPreferences";
import RecipeDetailsPage from "./pages/RecipeDetailsPage";
import RecipeSearchPage from "./pages/RecipeSearchPage";
import OrderSearchPage from "./pages/OrderSearchPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import FavoritesPage from "./pages/FavoritesPage";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import ManageMenuPage from "./pages/ManageMenuPage";
import ManageOrdersPage from "./pages/ManageOrdersPage";
import ManageRecipePage from "./pages/ManageRecipePage";
import ManageOffersPage from "./pages/ManageOffersPage";
import TestOffersPage from "./pages/TestOffersPage";
import ReportPage from "./pages/ReportPage";
import AuthorsTable from "./pages/AuthorsTable";
import ManageStaffPage from "./pages/ManageStaffPage";
import ManageUsersPage from "./pages/ManageUsersPage"; // ✅ NEW

// Staff system
import StaffRoute from "./StaffRoute";
import StaffLayout from "./layouts/StaffLayout";
import StaffDashboard from "./pages/StaffDashboard";

// ---------- Simple user guard ----------
function UserRoute({ children }) {
  const me = JSON.parse(localStorage.getItem("roms_current_user") || "null");
  if (!me) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();

  // Initialize Tawk.to with user info
  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("roms_current_user") || "null",
    );
    if (user) {
      initializeTawk(user);
    }
  }, []);

  // Initialize push notifications
  useEffect(() => {
    initializePushNotifications().catch(console.error);
  }, []);

  // ✅ staff area detect
  const isStaffArea = location.pathname.startsWith("/staff");

  // ✅ pages where main Navbar/Footer hide
  const hideLayoutPrefixes = [
    "/receipt",
    "/terms",
    "/privacy",
    "/admindashboard",
    "/managemenuadmin",
    "/manageordersadmin",
    "/managerecipesadmin",
    "/manageoffers",
    "/report",
    "/authors",
    "/login",
    "/register",
    "/managestaff",
    "/manageusers", // ✅ NEW
  ];

  const shouldHideLayout =
    isStaffArea ||
    hideLayoutPrefixes.some((p) => location.pathname.startsWith(p));

  return (
    <>
      <ScrollToTop />
      <NotificationPermission />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#f97316",
              secondary: "#fff",
            },
            style: {
              border: "2px solid #f97316",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              border: "2px solid #ef4444",
            },
          },
          loading: {
            iconTheme: {
              primary: "#f97316",
              secondary: "#fff",
            },
          },
        }}
      />
      {!shouldHideLayout && <Navbar />}

      <div className={!shouldHideLayout ? "pt-20" : ""}>
        <Routes>
          {/* ---------- Public ---------- */}
          <Route path="/" element={<Home />} />
          <Route path="/test-offers" element={<TestOffersPage />} />

          {/* ✅ BOTH routes open same Recipes listing page */}
          <Route path="/recipe" element={<Recipe_1st_page />} />
          <Route path="/recipes" element={<Recipe_1st_page />} />

          <Route path="/category/:categoryName" element={<CategoryPage />} />

          {/* ✅ Recipe details */}
          <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
          <Route path="/recipes/search" element={<RecipeSearchPage />} />
          <Route path="/about" element={<About />} />

          {/* ---------- Auth ---------- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ---------- User Protected ---------- */}
          <Route
            path="/profile"
            element={
              <UserRoute>
                <UserDashboard />
              </UserRoute>
            }
          />
          <Route
            path="/manage"
            element={
              <UserRoute>
                <ManageProfile />
              </UserRoute>
            }
          />
          <Route
            path="/notification-preferences"
            element={
              <UserRoute>
                <NotificationPreferences />
              </UserRoute>
            }
          />

          {/* ---------- Order Flow ---------- */}
          <Route path="/order_1st" element={<Order_1st_Page />} />
          <Route
            path="/order/category/:menuCategory"
            element={<MenuCategoryPage />}
          />
          <Route path="/menu/:menuItemName" element={<MenuDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order/search" element={<OrderSearchPage />} />

          <Route
            path="/place_order"
            element={
              <UserRoute>
                <PlaceOrderPage />
              </UserRoute>
            }
          />
          <Route
            path="/receipt"
            element={
              <UserRoute>
                <ReceiptPage />
              </UserRoute>
            }
          />
          <Route
            path="/order_tracking"
            element={
              <UserRoute>
                <OrderTrackingPage />
              </UserRoute>
            }
          />
          <Route
            path="/payment-success"
            element={
              <UserRoute>
                <PaymentSuccessPage />
              </UserRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <UserRoute>
                <FavoritesPage />
              </UserRoute>
            }
          />

          {/* ---------- Legal ---------- */}
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* ---------- Admin ---------- */}
          <Route
            path="/admindashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/managemenuadmin"
            element={
              <PrivateRoute>
                <ManageMenuPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/manageordersadmin"
            element={
              <PrivateRoute>
                <ManageOrdersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/managerecipesadmin"
            element={
              <PrivateRoute>
                <ManageRecipePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/manageoffers"
            element={
              <PrivateRoute>
                <ManageOffersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/report"
            element={
              <PrivateRoute>
                <ReportPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/authors"
            element={
              <PrivateRoute>
                <AuthorsTable />
              </PrivateRoute>
            }
          />
          <Route
            path="/managestaff"
            element={
              <PrivateRoute>
                <ManageStaffPage />
              </PrivateRoute>
            }
          />

          {/* ✅ NEW: Manage Users */}
          <Route
            path="/manageusers"
            element={
              <PrivateRoute>
                <ManageUsersPage />
              </PrivateRoute>
            }
          />

          {/* ---------- Staff (Separate Layout) ---------- */}
          <Route
            path="/staff"
            element={
              <StaffRoute>
                <StaffLayout />
              </StaffRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="user-control" element={<ReportPage />} />
            <Route path="orders" element={<ManageOrdersPage />} />
          </Route>

          {/* ---------- Fallback ---------- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!shouldHideLayout && <Footer />}
    </>
  );
}
