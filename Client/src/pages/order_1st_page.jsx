// path: src/pages/order_1st_page.jsx
import React, { useEffect, useMemo, useState } from "react";
import orderData from "../data/order_1st_page.json";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  getPlaceholderImage,
  handleImageError,
} from "../utils/placeholderImage";

const API_BASE = ""; // Use Vite proxy

const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const normalize = (str = "") => String(str).toLowerCase().trim();

function capCategory(cat = "") {
  const x = String(cat).trim().toLowerCase();
  if (!x) return "";
  return x.charAt(0).toUpperCase() + x.slice(1);
}

export default function Order_1st_Page() {
  const navigate = useNavigate();

  const offerItems = orderData.offerItems || [];

  const categoryOrder = ["beef", "chicken", "fish", "soup", "dessert", "drink"];

  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuErr, setMenuErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingMenu(true);
        setMenuErr("");
        const res = await fetch(`${API_BASE}/api/menu-items`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to load menu items");
        setMenuItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setMenuErr(e?.message || "Failed to load");
        setMenuItems([]);
      } finally {
        setLoadingMenu(false);
      }
    };
    load();
  }, []);

  const recomItems = useMemo(() => {
    const grouped = {};
    for (const it of menuItems) {
      const c = normalize(it?.category);
      const key = c;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        _id: it._id,
        name: it.name,
        price: Number(it.price || 0),
        weight: it.weight || it.size || it.portion || "—",
        img: it.imageUrl || it.pic || it.img || "",
        category: key,
      });
    }

    const pointers = Object.fromEntries(categoryOrder.map((c) => [c, 0]));
    const out = [];
    let canContinue = true;

    while (canContinue) {
      canContinue = false;
      for (const cat of categoryOrder) {
        const list = grouped[cat] || [];
        const idx = pointers[cat] || 0;
        if (idx < list.length) {
          out.push(list[idx]);
          pointers[cat] = idx + 1;
          canContinue = true;
        }
      }
    }

    if (!out.length && menuItems.length) {
      return menuItems.map((it) => ({
        _id: it._id,
        name: it.name,
        price: Number(it.price || 0),
        weight: it.weight || it.size || it.portion || "—",
        img: it.imageUrl || it.pic || it.img || "",
        category: normalize(it.category || ""),
      }));
    }

    return out;
  }, [menuItems]);

  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const categoryOptions = useMemo(() => {
    const set = new Set();
    categoryOrder.forEach((c) => set.add(c));
    menuItems.forEach((it) => {
      const c = normalize(it?.category);
      if (c) set.add(c);
    });
    return ["All", ...Array.from(set)];
  }, [menuItems]);

  const applySearch = () => {
    const q = searchText || "";
    const cat = filterCategory || "All";
    navigate(
      `/order/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`,
    );
  };

  const [offerIndex, setOfferIndex] = useState(0);
  const [recomIndex, setRecomIndex] = useState(0);

  const [quantities, setQuantities] = useState([]);
  useEffect(() => {
    setQuantities(
      recomItems.map((item) => ({ id: item._id, name: item.name, qty: 1 })),
    );
  }, [recomItems]);

  const { cartItems, addToCart } = useCart();
  const [slideCartVisible, setSlideCartVisible] = useState(false);

  const offerItemsPerSlide = 3;
  const offerItemsPerSlideMobile = 2;

  const recomItemsPerSlideDesktop = 3;
  const recomItemsPerSlideMobile = 1;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const offerItemsPerSlideNow = isMobile
    ? offerItemsPerSlideMobile
    : offerItemsPerSlide;
  const recomItemsPerSlideNow = isMobile
    ? recomItemsPerSlideMobile
    : recomItemsPerSlideDesktop;

  const offerSlidesCount =
    Math.ceil(offerItems.length / offerItemsPerSlideNow) || 1;
  const recomSlidesCount = Math.max(
    1,
    Math.ceil(recomItems.length / recomItemsPerSlideNow) || 1,
  );

  const scrollOffer = (dir) => {
    setOfferIndex((prev) => (prev + dir + offerSlidesCount) % offerSlidesCount);
  };

  const scrollRecom = (dir) => {
    setRecomIndex((prev) => (prev + dir + recomSlidesCount) % recomSlidesCount);
  };

  const increaseQty = (id) => {
    setQuantities((prev) =>
      prev.map((q) => (q.id === id ? { ...q, qty: q.qty + 1 } : q)),
    );
  };

  const decreaseQty = (id) => {
    setQuantities((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, qty: q.qty > 1 ? q.qty - 1 : 1 } : q,
      ),
    );
  };

  const handleAddToCart = (itemId) => {
    const qtyObj = quantities.find((q) => q.id === itemId);
    const item = recomItems.find((i) => i._id === itemId);
    if (item && qtyObj) {
      addToCart(
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          img: item.img,
        },
        qtyObj.qty,
      );
      setSlideCartVisible(true);
      setTimeout(() => setSlideCartVisible(false), 2000);
    }
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="bg-white w-full relative min-h-screen">
      {/* Floating Cart Badge - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link
          to="/cart"
          className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 shadow-premium hover:shadow-premium-lg hover:scale-110 transition-all duration-300 animate-pulse-glow"
        >
          <i className="fas fa-shopping-cart text-white text-2xl"></i>
          {totalCartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black shadow-lg animate-bounce-subtle">
              {totalCartCount}
            </span>
          )}
          <div className="absolute inset-0 rounded-full bg-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </Link>
      </div>

      {/* Hero Banner with Parallax Effect */}
      <section className="relative w-full h-[450px] md:h-[550px] lg:h-[650px] overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover transform scale-105"
          style={{
            backgroundImage: "url('https://i.ibb.co/7xV4zn0w/chicken.jpg')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-white"></div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full px-6 text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-white drop-shadow-2xl animate-fade-in">
              Order Your
              <span className="block text-orange-400">Cravings</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 mb-4 drop-shadow-lg font-light">
              Explore a world of mouth-watering meals prepared with care.
            </p>
            <p className="text-base md:text-xl text-white/80 drop-shadow-lg font-light">
              From spicy bites to sweet indulgences — we deliver flavor fast!
            </p>

            <div className="mt-10 flex justify-center gap-4">
              <div className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold">
                🍕 Fresh Ingredients
              </div>
              <div className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold">
                🚀 Fast Delivery
              </div>
              <div className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold hidden md:block">
                ❤️ Made with Love
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full">
            <path
              fill="#ffffff"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Search Bar - Floating Design */}
      <section className="max-w-4xl mx-auto -mt-12 px-6 mb-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-gray-50 px-5 py-4 focus-within:border-orange-500 focus-within:bg-white transition-all">
                <svg
                  className="w-6 h-6 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.3-4.3m1.3-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  placeholder="Search for delicious food..."
                  className="w-full outline-none text-base bg-transparent font-medium text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="w-full md:w-56">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white text-base font-medium text-gray-700 transition-all"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c === "All"
                      ? "All Categories"
                      : c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={applySearch}
              className="px-8 py-4 rounded-2xl bg-orange-500 text-white text-base font-black hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition-all"
            >
              Search
            </button>
          </div>

          {/* Status Bar */}
          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <p className="text-sm font-semibold text-gray-600">
                {loadingMenu
                  ? "Loading menu..."
                  : `${menuItems.length} delicious items available`}
              </p>
            </div>
            {menuErr && (
              <p className="text-sm text-red-500 font-medium">⚠️ {menuErr}</p>
            )}
          </div>
        </div>
      </section>

      {/* We Offer Section */}
      <section className="mt-8 px-6 w-full max-w-7xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-orange-600 mb-3">
            We Offer
          </h2>
          <p className="text-gray-600 text-lg font-medium">
            Explore our finest categories
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <button
            onClick={() => scrollOffer(-1)}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white shadow-xl border-2 border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white hover:scale-110 transition-all"
          >
            <i className="fas fa-chevron-left text-xl"></i>
          </button>

          <div
            className={`overflow-hidden ${isMobile ? "w-[340px]" : "w-[580px]"}`}
          >
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                width: `${offerSlidesCount * (isMobile ? 340 : 580)}px`,
                transform: `translateX(-${offerIndex * (isMobile ? 340 : 580)}px)`,
              }}
            >
              {Array.from({ length: offerSlidesCount }).map((_, slideIdx) => (
                <div
                  key={slideIdx}
                  className={`flex justify-center ${isMobile ? "gap-6" : "gap-10"} shrink-0`}
                  style={{ width: isMobile ? "340px" : "580px" }}
                >
                  {offerItems
                    .slice(
                      slideIdx * offerItemsPerSlideNow,
                      slideIdx * offerItemsPerSlideNow + offerItemsPerSlideNow,
                    )
                    .map(({ name, img }) => (
                      <div
                        key={name}
                        className="relative w-40 h-40 md:w-44 md:h-44 rounded-full overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500"
                      >
                        <img
                          src={img}
                          alt={name}
                          className="w-full h-full object-cover rounded-full transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full flex flex-col items-center justify-center text-center px-3">
                          <p className="text-white font-black text-base mb-3 drop-shadow-lg">
                            {name}
                          </p>
                          <Link
                            to={`/order/category/${normalize(name)}`}
                            className="px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 hover:shadow-lg transform hover:scale-110 transition-all"
                          >
                            Explore →
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => scrollOffer(1)}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white shadow-xl border-2 border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white hover:scale-110 transition-all"
          >
            <i className="fas fa-chevron-right text-xl"></i>
          </button>
        </div>
      </section>

      {/* Recommended Section */}
      <section className="mt-12 mb-20 px-6 max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-orange-600 mb-3">
            Recommended For You
          </h2>
          <p className="text-gray-600 text-lg font-medium">
            Handpicked favorites just for you
          </p>
        </div>

        {loadingMenu ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              Loading delicious recommendations...
            </p>
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => scrollRecom(-1)}
              className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white shadow-xl border-2 border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white hover:scale-110 transition-all"
            >
              <i className="fas fa-chevron-left text-xl"></i>
            </button>

            <div
              className={`overflow-hidden ${isMobile ? "w-[360px]" : "w-[1140px]"}`}
            >
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  width: `${recomSlidesCount * (isMobile ? 360 : 1140)}px`,
                  transform: `translateX(-${recomIndex * (isMobile ? 360 : 1140)}px)`,
                }}
              >
                {Array.from({ length: recomSlidesCount }).map((_, slideIdx) => (
                  <div
                    key={slideIdx}
                    className="flex justify-center gap-6 md:gap-8 shrink-0"
                    style={{ width: isMobile ? "360px" : "1140px" }}
                  >
                    {recomItems
                      .slice(
                        slideIdx * recomItemsPerSlideNow,
                        slideIdx * recomItemsPerSlideNow +
                          recomItemsPerSlideNow,
                      )
                      .map((it) => {
                        const qtyObj = quantities.find((q) => q.id === it._id);
                        return (
                          <div
                            key={it._id}
                            className="relative group bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-orange-300 transition-all duration-500"
                            style={{ width: isMobile ? "340px" : "360px" }}
                          >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden rounded-t-3xl">
                              <img
                                src={
                                  it.img ||
                                  getPlaceholderImage(600, 400, "Menu")
                                }
                                alt={it.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                onError={(e) =>
                                  handleImageError(e, it.name || "Menu")
                                }
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                              {/* Category Badge */}
                              {it.category && (
                                <div className="absolute top-4 left-4">
                                  <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-black shadow-lg">
                                    {capCategory(it.category)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                              <h3 className="text-2xl font-black text-gray-900 mb-2">
                                {it.name}
                              </h3>

                              <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-gray-600 font-medium">
                                  Weight:{" "}
                                  <span className="font-bold text-gray-900">
                                    {it.weight}
                                  </span>
                                </p>
                                <p className="text-2xl font-black text-orange-600">
                                  TK{Number(it.price || 0).toFixed(2)}
                                </p>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 items-center">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-1">
                                  <button
                                    onClick={() => decreaseQty(it._id)}
                                    className="w-9 h-9 rounded-full bg-white text-orange-600 font-black hover:bg-orange-500 hover:text-white transition-all shadow-md"
                                  >
                                    -
                                  </button>
                                  <span className="px-4 py-1 font-black text-gray-900 select-none min-w-[40px] text-center">
                                    {qtyObj?.qty || 1}
                                  </span>
                                  <button
                                    onClick={() => increaseQty(it._id)}
                                    className="w-9 h-9 rounded-full bg-white text-orange-600 font-black hover:bg-orange-500 hover:text-white transition-all shadow-md"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Add to Cart */}
                                <button
                                  onClick={() => handleAddToCart(it._id)}
                                  className="flex-1 px-4 py-3 rounded-full bg-orange-500 text-white text-sm font-black hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition-all"
                                >
                                  Add to Cart
                                </button>

                                {/* Details Link */}
                                <Link
                                  to={`/menu/${slugify(it.name)}`}
                                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-orange-500 hover:text-white transition-all shadow-md"
                                >
                                  <i className="fas fa-info text-lg"></i>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => scrollRecom(1)}
              className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white shadow-xl border-2 border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white hover:scale-110 transition-all"
            >
              <i className="fas fa-chevron-right text-xl"></i>
            </button>
          </div>
        )}
      </section>

      {/* Slide-in Notification - Enhanced */}
      <div
        className={`fixed top-6 left-6 bg-green-500 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50 select-none transition-all duration-500 ${
          slideCartVisible
            ? "translate-x-0 opacity-100 scale-100"
            : "-translate-x-full opacity-0 scale-95"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <i className="fas fa-check text-xl"></i>
        </div>
        <div>
          <p className="font-black text-lg">Added to Cart!</p>
          <p className="text-sm text-white/80">Check your cart to continue</p>
        </div>
      </div>
    </div>
  );
}
