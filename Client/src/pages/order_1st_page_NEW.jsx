// Modern Professional Order Page
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { showSuccess, showError } from "../utils/toast";

const CATEGORIES = [
  "All",
  "Beef",
  "Chicken",
  "Fish",
  "Soup",
  "Dessert",
  "Drink",
];

const CATEGORY_COLORS = {
  Beef: "from-red-500 to-rose-500",
  Chicken: "from-orange-500 to-amber-500",
  Fish: "from-blue-500 to-cyan-500",
  Soup: "from-green-500 to-emerald-500",
  Dessert: "from-pink-500 to-purple-500",
  Drink: "from-indigo-500 to-purple-500",
};

export default function Order_1st_Page() {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/menu-items");
      if (!res.ok) throw new Error("Failed to load menu items");
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);

      // Initialize quantities
      const initialQty = {};
      data.forEach((item) => {
        initialQty[item._id] = 1;
      });
      setQuantities(initialQty);
    } catch (err) {
      setError(err.message || "Failed to load menu");
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    return menuItems.filter((item) => {
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "All" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchText, selectedCategory]);

  const stats = useMemo(() => {
    const total = menuItems.length;
    const available = menuItems.filter(
      (item) => item.available !== false,
    ).length;
    const categories = new Set(menuItems.map((item) => item.category)).size;
    return { total, available, categories };
  }, [menuItems]);

  const handleAddToCart = (item) => {
    const qty = quantities[item._id] || 1;
    addToCart({
      id: item._id,
      menuItemId: item._id, // Add this for order placement
      name: item.name,
      price: item.price,
      image: item.imageUrl || item.pic,
      quantity: qty,
    });
    showSuccess(`${item.name} added to cart!`);
  };

  const updateQuantity = (itemId, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta),
    }));
  };

  const getItemInCart = (itemId) => {
    return cartItems.find((item) => item.id === itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
          </div>
          <p className="text-slate-800 text-2xl font-black">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl">
                  🍽️
                </div>
                <div>
                  <p className="text-orange-100 text-sm font-semibold">
                    FoodBuzz Menu
                  </p>
                  <h1 className="text-4xl md:text-5xl font-black">
                    Order Delicious Food
                  </h1>
                </div>
              </div>
              <p className="text-orange-100 text-lg max-w-2xl">
                Browse our menu, add items to cart, and enjoy fresh, delicious
                meals delivered to your door!
              </p>
            </div>

            <Link
              to="/cart"
              className="relative px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold hover:bg-orange-50 transition-all shadow-lg hover:scale-105"
            >
              <span className="flex items-center gap-2">
                🛒 View Cart
                {cartItems.length > 0 && (
                  <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm">
                    {cartItems.length}
                  </span>
                )}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 text-center">
            <div className="text-4xl mb-2">🍕</div>
            <div className="text-3xl font-black text-orange-600">
              {stats.total}
            </div>
            <div className="text-sm font-semibold text-slate-600">
              Total Items
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-green-100 p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-black text-green-600">
              {stats.available}
            </div>
            <div className="text-sm font-semibold text-slate-600">
              Available
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-blue-100 p-6 text-center">
            <div className="text-4xl mb-2">📂</div>
            <div className="text-3xl font-black text-blue-600">
              {stats.categories}
            </div>
            <div className="text-sm font-semibold text-slate-600">
              Categories
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-lg"
              />
              <svg
                className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        {error ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-red-100 p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-black text-red-600 mb-2">
              Error Loading Menu
            </h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={fetchMenuItems}
              className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-20 text-center">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">
              No Items Found
            </h3>
            <p className="text-slate-600 text-lg mb-6">
              Try a different search term or category
            </p>
            <button
              onClick={() => {
                setSearchText("");
                setSelectedCategory("All");
              }}
              className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 hover:scale-105 transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const inCart = getItemInCart(item._id);
              const qty = quantities[item._id] || 1;

              return (
                <div
                  key={item._id}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                    <img
                      src={
                        item.imageUrl ||
                        item.pic ||
                        `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80`
                      }
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80`;
                      }}
                    />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-4 py-2 rounded-full text-white text-sm font-bold bg-gradient-to-r ${CATEGORY_COLORS[item.category] || "from-gray-500 to-gray-600"}`}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* In Cart Badge */}
                    {inCart && (
                      <div className="absolute top-3 right-3">
                        <span className="px-4 py-2 rounded-full bg-green-500 text-white text-sm font-bold flex items-center gap-1">
                          ✓ In Cart ({inCart.quantity})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-black text-slate-800 mb-2 line-clamp-1">
                      {item.name}
                    </h3>

                    {item.description && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl font-black text-orange-600">
                        ৳{item.price}
                      </div>
                      {item.weight && (
                        <span className="text-sm text-slate-500 font-semibold">
                          {item.weight}
                        </span>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-bold text-slate-700">
                        Quantity:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-all"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-bold text-lg">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
