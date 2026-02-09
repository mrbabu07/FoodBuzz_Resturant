import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { showSuccess, showError } from "../utils/toast";
import data from "../data/Recipe_1st_Page.json";

// Helper to check if user is logged in
const isLoggedIn = () => {
  const user = localStorage.getItem("roms_current_user");
  return !!user;
};

// ✅ FIXED categories (total 6)
const CATEGORIES = ["Chicken", "Beef", "Fish", "Soup", "Dessert", "Drink"];

const positions = data.positions || [];
const jsonCategories = data.categories || []; // only for category images

function normalize(str = "") {
  return String(str).toLowerCase().trim();
}

function getSlideIndexAtPosition(centerIndex, positionIndex, length) {
  const offsetMap = [0, -1, -2, 1, 2];
  const offset = offsetMap[positionIndex] ?? 0;
  return (centerIndex + offset + length) % length;
}

// Category color mapping
const CATEGORY_COLORS = {
  chicken: "#f59e0b",
  beef: "#dc2626",
  fish: "#0ea5e9",
  soup: "#10b981",
  dessert: "#ec4899",
  drink: "#8b5cf6",
};

export default function Recipe_1st_page() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Detect if we're on trending or recent page
  const pageType = location.pathname.includes("/trending")
    ? "trending"
    : location.pathname.includes("/recent")
      ? "recent"
      : "all";

  // ✅ Search states
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  // ✅ recipes from backend
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [error, setError] = useState("");
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalCategories: CATEGORIES.length,
    averageRating: 4.8,
    totalViews: 0,
  });

  // Favorites state
  const [favoriteRecipes, setFavoriteRecipes] = useState(new Set());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning! 🌅";
    if (hour < 17) return "Good Afternoon! ☀️";
    return "Good Evening! 🌙";
  };

  // Get cooking suggestion based on time
  const getCookingSuggestion = () => {
    const hour = currentTime.getHours();
    if (hour < 11) return { meal: "Breakfast", emoji: "🥞", category: "Drink" };
    if (hour < 16) return { meal: "Lunch", emoji: "🍽️", category: "Soup" };
    return { meal: "Dinner", emoji: "🍝", category: "Chicken" };
  };

  const currentSuggestion = getCookingSuggestion();

  // ✅ build category cards from FIXED list, reuse images from JSON
  const categoryCards = useMemo(() => {
    const byName = new Map(
      (jsonCategories || [])
        .filter((c) => c?.name)
        .map((c) => [normalize(c.name), c]),
    );

    // Create a simple colored placeholder as data URL
    const createPlaceholder = (name, color = "#f97316") => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 600, 800);

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name, 300, 400);

      return canvas.toDataURL();
    };

    const fallbackImg = (name) => {
      const colors = {
        chicken: "#f59e0b",
        beef: "#dc2626",
        fish: "#0ea5e9",
        soup: "#10b981",
        dessert: "#ec4899",
        drink: "#8b5cf6",
      };
      return createPlaceholder(name, colors[normalize(name)] || "#f97316");
    };

    return CATEGORIES.map((name) => {
      const found = byName.get(normalize(name));
      const img =
        found?.image || found?.pic || found?.img || found?.imageUrl || "";

      return {
        name,
        image:
          img && String(img).trim() ? String(img).trim() : fallbackImg(name),
      };
    });
  }, []);

  const categoryOptions = useMemo(() => ["All", ...CATEGORIES], []);

  // ✅ load recipes from backend based on page type
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingRecipes(true);
        setError("");

        let endpoint = "/api/recipes";
        let allRecipes = [];

        // Fetch based on page type
        if (pageType === "trending") {
          endpoint = "/api/recipes/trending?limit=20";
          const recipesRes = await fetch(endpoint);
          if (!recipesRes.ok)
            throw new Error("Failed to fetch trending recipes");
          const recipesData = await recipesRes.json();
          allRecipes = Array.isArray(recipesData) ? recipesData : [];
          setRecipes(allRecipes);
          setFeaturedRecipes(allRecipes);
        } else if (pageType === "recent") {
          endpoint = "/api/recipes/recent?limit=20";
          const recipesRes = await fetch(endpoint);
          if (!recipesRes.ok) throw new Error("Failed to fetch recent recipes");
          const recipesData = await recipesRes.json();
          allRecipes = Array.isArray(recipesData) ? recipesData : [];
          setRecipes(allRecipes);
          setFeaturedRecipes(allRecipes);
        } else {
          // Fetch all recipes
          const recipesRes = await fetch("/api/recipes");
          if (!recipesRes.ok) throw new Error("Failed to fetch recipes");
          const recipesData = await recipesRes.json();
          allRecipes = Array.isArray(recipesData) ? recipesData : [];
          setRecipes(allRecipes);

          // Set featured recipes (first 6)
          setFeaturedRecipes(allRecipes.slice(0, 6));

          // Set trending recipes (random selection)
          const shuffled = [...allRecipes].sort(() => 0.5 - Math.random());
          setTrendingRecipes(shuffled.slice(0, 4));

          // Set recent recipes (last 4)
          setRecentRecipes(allRecipes.slice(-4).reverse());
        }

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalRecipes: allRecipes.length,
          totalViews: allRecipes.length * 150, // Simulated views
        }));

        // Load user's favorite recipes if logged in
        if (isLoggedIn()) {
          try {
            const favRes = await apiFetch("/api/favorites/recipes");
            if (favRes && Array.isArray(favRes)) {
              setFavoriteRecipes(new Set(favRes.map((r) => r._id)));
            }
          } catch (err) {
            console.log("Failed to load favorites:", err);
          }
        }
      } catch (e) {
        console.log("Recipe fetch failed:", e.message);
        setError(e.message);
        setRecipes([]);
      } finally {
        setLoadingRecipes(false);
      }
    };
    load();
  }, [pageType]);

  // Toggle favorite
  const toggleFavorite = async (recipeId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isLoggedIn()) {
      showError("Please login to add favorites");
      navigate("/login");
      return;
    }

    const isFavorite = favoriteRecipes.has(recipeId);

    try {
      if (isFavorite) {
        await apiFetch(`/api/favorites/recipes/${recipeId}`, {
          method: "DELETE",
        });
        setFavoriteRecipes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
        showSuccess("Removed from favorites 💔");
      } else {
        await apiFetch(`/api/favorites/recipes/${recipeId}`, {
          method: "POST",
        });
        setFavoriteRecipes((prev) => new Set([...prev, recipeId]));
        showSuccess("Added to favorites! ❤️");
      }
    } catch (err) {
      showError(err.message || "Failed to update favorites");
    }
  };

  // ✅ Filtered and sorted recipes
  const filteredFeatured = useMemo(() => {
    const q = normalize(searchText);
    const cat = normalize(filterCategory);

    let filtered = (recipes || []).filter((r) => {
      const name = normalize(r?.name);
      const category = normalize(r?.category);
      const desc = normalize(r?.description);
      const ingArr = Array.isArray(r?.ingredients) ? r.ingredients : [];
      const ingredientsText = normalize(ingArr.join(" "));

      const matchText =
        !q ||
        name.includes(q) ||
        category.includes(q) ||
        desc.includes(q) ||
        ingredientsText.includes(q);

      const matchCategory = filterCategory === "All" || cat === category;

      return matchText && matchCategory;
    });

    // Sort recipes
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "difficulty":
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        filtered.sort(
          (a, b) =>
            (difficultyOrder[a.difficulty] || 2) -
            (difficultyOrder[b.difficulty] || 2),
        );
        break;
      case "time":
        filtered.sort(
          (a, b) =>
            (a.prepTime || 0) +
            (a.cookTime || 0) -
            ((b.prepTime || 0) + (b.cookTime || 0)),
        );
        break;
      case "recent":
        filtered.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        break;
      default: // popular
        filtered.sort(() => 0.5 - Math.random()); // Random for now
    }

    return filtered;
  }, [recipes, searchText, filterCategory, sortBy]);

  // ✅ Navigate to search results page
  const applySearch = () => {
    const q = searchText || "";
    const cat = filterCategory || "All";
    navigate(
      `/recipes/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`,
    );
  };

  const safePositions =
    positions.length === 5
      ? positions
      : [
          { x: 0, y: 0, scale: 1, rotateY: 0, z: 50 },
          { x: -220, y: 20, scale: 0.9, rotateY: 20, z: 40 },
          { x: -420, y: 40, scale: 0.8, rotateY: 35, z: 30 },
          { x: 220, y: 20, scale: 0.9, rotateY: -20, z: 40 },
          { x: 420, y: 40, scale: 0.8, rotateY: -35, z: 30 },
        ];

  if (loadingRecipes) {
    return (
      <div className="bg-white w-full relative min-h-screen">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 px-4 text-center text-sm font-semibold">
          <div className="flex justify-center items-center gap-4">
            <span>🔄 Loading Recipes...</span>
          </div>
        </div>

        <div className="container-custom py-20">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Loading Delicious Recipes... 🍳
            </h2>
            <p className="text-gray-600">
              Preparing the best recipes for you to explore
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && recipes.length === 0) {
    return (
      <div className="bg-white w-full relative min-h-screen">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 text-center text-sm font-semibold">
          <div className="flex justify-center items-center gap-4">
            <span>⚠️ Connection Error</span>
          </div>
        </div>

        <div className="container-custom py-20">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-100 p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 hover:scale-105 transition-all"
              >
                🔄 Try Again
              </button>
              <Link
                to="/"
                className="px-8 py-4 rounded-2xl bg-gray-500 text-white font-bold hover:bg-gray-600 hover:scale-105 transition-all"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 w-full relative min-h-screen">
      {/* Dynamic Status Bar - Same as Home */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white py-2 px-4 text-center text-sm font-semibold shadow-lg">
        <div className="flex justify-center items-center gap-4 flex-wrap">
          <span>{getGreeting()}</span>
          <span>•</span>
          <span>🕐 {currentTime.toLocaleTimeString()}</span>
          <span>•</span>
          <span>
            👨‍🍳 Perfect for {currentSuggestion.meal} {currentSuggestion.emoji}
          </span>
          <span>•</span>
          <span>📚 {stats.totalRecipes}+ Recipes Available</span>
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full opacity-10 blur-3xl animate-float"></div>
      <div
        className="absolute top-40 right-20 w-40 h-40 bg-amber-200 rounded-full opacity-10 blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-20 left-1/4 w-36 h-36 bg-orange-300 rounded-full opacity-10 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="container-custom py-10 relative">
        {/* Hero Section - Enhanced with Home page styling */}
        <header className="relative mb-16 animate-slide-up">
          <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden backdrop-blur-xl">
            <div className="relative h-[400px] sm:h-[450px] md:h-[500px]">
              <img
                src="https://i.ibb.co/23Yc8nqb/recipe-1st-sector-bg.jpg"
                alt="Delicious Recipes"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full px-8 md:px-12">
                  <div className="max-w-3xl text-white">
                    <div className="inline-flex items-center gap-3 rounded-full bg-orange-500/90 backdrop-blur-sm px-6 py-3 text-sm mb-6 font-bold">
                      <span className="text-2xl">
                        {pageType === "trending"
                          ? "🔥"
                          : pageType === "recent"
                            ? "🆕"
                            : "🍽️"}
                      </span>
                      <span>
                        {pageType === "trending"
                          ? "Trending Recipes"
                          : pageType === "recent"
                            ? "Recently Added Recipes"
                            : "FoodBuzz Recipe Collection"}
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6">
                      {pageType === "trending" ? (
                        <>
                          Trending & Popular
                          <span className="block text-orange-400">
                            Recipes Right Now 🔥
                          </span>
                        </>
                      ) : pageType === "recent" ? (
                        <>
                          Fresh & New
                          <span className="block text-orange-400">
                            Recipe Additions 🆕
                          </span>
                        </>
                      ) : (
                        <>
                          Explore Delightful
                          <span className="block text-orange-400">
                            Culinary Creations
                          </span>
                        </>
                      )}
                    </h1>

                    <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
                      {pageType === "trending"
                        ? "Check out what everyone is cooking! These recipes are hot right now and loved by our community. 🌟"
                        : pageType === "recent"
                          ? "Discover our latest recipe additions! Fresh ideas and new flavors added just for you. ✨"
                          : "Discover easy-to-follow recipes with fresh ingredients and authentic flavors. From quick meals to gourmet dishes - we've got you covered! 👨‍🍳"}
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={applySearch}
                        className="px-8 py-4 rounded-2xl bg-orange-500 text-white text-lg font-black hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition-all"
                      >
                        🔍 Search Recipes
                      </button>
                      <Link
                        to="/recipes/search"
                        className="px-8 py-4 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 text-white font-black hover:bg-white/30 hover:scale-105 transition-all"
                      >
                        📚 Browse All
                      </Link>
                    </div>

                    {/* Dynamic Stats */}
                    <div className="flex flex-wrap gap-8 mt-12">
                      <div className="text-center">
                        <div className="text-3xl font-black text-white">
                          {stats.totalRecipes}+
                        </div>
                        <div className="text-sm text-white/80">Recipes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-white">
                          {stats.totalCategories}
                        </div>
                        <div className="text-sm text-white/80">Categories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-white">
                          {stats.averageRating}★
                        </div>
                        <div className="text-sm text-white/80">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-white">
                          {stats.totalViews}+
                        </div>
                        <div className="text-sm text-white/80">Views</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Search + Filter - Enhanced with Home page styling */}
        <section className="max-w-6xl mx-auto -mt-12 px-6 mb-16 relative z-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3">
                🔍 Find Your Perfect Recipe
              </h2>
              <p className="text-gray-600 text-lg font-medium">
                Search by ingredients, category, or cooking time
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔍 Search Recipes
                </label>
                <div className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-gray-50 px-6 py-4 focus-within:border-orange-500 focus-within:bg-white transition-all">
                  <i className="fas fa-search text-orange-500"></i>
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applySearch();
                    }}
                    placeholder="Search by name, ingredients..."
                    className="w-full outline-none text-lg bg-transparent text-gray-900 placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🍴 Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white text-lg font-medium text-gray-900 transition-all"
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "🍽️ All Categories" : `🥘 ${c}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📊 Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-orange-500 focus:bg-white text-lg font-medium text-gray-900 transition-all"
                >
                  <option value="popular">🔥 Popular</option>
                  <option value="name">📝 Name A-Z</option>
                  <option value="difficulty">⭐ Difficulty</option>
                  <option value="time">⏱️ Cooking Time</option>
                  <option value="recent">🆕 Recently Added</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="text-center mt-8">
              <button
                onClick={applySearch}
                className="px-8 py-4 rounded-2xl bg-orange-500 text-white text-lg font-black hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition-all"
              >
                🔍 Search Recipes
              </button>
            </div>

            {/* Status Bar */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                <p className="text-base font-bold text-gray-700">
                  {loadingRecipes
                    ? "🔄 Loading recipes..."
                    : `🎉 Found ${filteredFeatured.length} of ${stats.totalRecipes} recipes`}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>👨‍🍳 Suggested: {currentSuggestion.category} recipes</span>
                <span>•</span>
                <span>⏰ {currentTime.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Trending & Recent Recipes */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trending Recipes */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 p-8 hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  🔥 Trending Now
                </h3>
                <div className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold">
                  Hot Picks
                </div>
              </div>

              <div className="space-y-4">
                {trendingRecipes.slice(0, 3).map((recipe, index) => (
                  <div
                    key={recipe._id || index}
                    className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-all cursor-pointer"
                  >
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-16 h-16 rounded-xl object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f97316"/><text x="32" y="32" text-anchor="middle" dy=".3em" fill="white" font-size="12">🍽️</text></svg>`;
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 line-clamp-1">
                        {recipe.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {recipe.category} • {recipe.difficulty || "Easy"}
                      </p>
                    </div>
                    <div className="text-orange-600 font-bold">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/recipes/trending"
                className="w-full mt-6 block text-center px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all"
              >
                View All Trending
              </Link>
            </div>

            {/* Recent Recipes */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-100 p-8 hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  🆕 Recently Added
                </h3>
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
                  Fresh
                </div>
              </div>

              <div className="space-y-4">
                {recentRecipes.slice(0, 3).map((recipe, index) => (
                  <div
                    key={recipe._id || index}
                    className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-all cursor-pointer"
                  >
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-16 h-16 rounded-xl object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%2310b981"/><text x="32" y="32" text-anchor="middle" dy=".3em" fill="white" font-size="12">🍽️</text></svg>`;
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 line-clamp-1">
                        {recipe.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {recipe.category} • Just added
                      </p>
                    </div>
                    <div className="text-green-600 font-bold text-sm">New</div>
                  </div>
                ))}
              </div>

              <Link
                to="/recipes/recent"
                className="w-full mt-6 block text-center px-6 py-3 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all"
              >
                View All Recent
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Carousel - Enhanced with Home page styling */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 p-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                Recipe Categories 🍽️
              </h2>
              <p className="text-xl text-gray-600">
                Pick a category and explore recipes instantly
              </p>
            </div>

            <div className="relative max-w-7xl mx-auto h-[350px] sm:h-[400px] my-10 perspective-[1200px]">
              <div className="relative flex justify-center items-center h-full gap-4 sm:gap-6">
                {safePositions.map((pos, i) => {
                  const idx = getSlideIndexAtPosition(
                    currentCategoryIndex,
                    i,
                    categoryCards.length,
                  );
                  const category = categoryCards[idx];

                  return (
                    <div
                      key={`${category.name}-${i}`}
                      onClick={() => setCurrentCategoryIndex(idx)}
                      className="absolute w-44 sm:w-64 h-64 sm:h-80 rounded-3xl shadow-2xl cursor-pointer overflow-hidden group transition-all duration-700 ease-in-out border-2 border-gray-200 bg-white hover:shadow-2xl hover:border-orange-300"
                      style={{
                        transform: `translateX(${pos.x}px) translateY(${pos.y}px) scale(${pos.scale}) rotateY(${pos.rotateY}deg)`,
                        zIndex: pos.z,
                      }}
                    >
                      <img
                        src={category.image}
                        alt={category.name}
                        onError={(e) => {
                          const colors = {
                            chicken: "#f59e0b",
                            beef: "#dc2626",
                            fish: "#0ea5e9",
                            soup: "#10b981",
                            dessert: "#ec4899",
                            drink: "#8b5cf6",
                          };

                          const color =
                            colors[category.name.toLowerCase()] || "#f97316";
                          e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="${color}"/><text x="300" y="400" text-anchor="middle" dy=".3em" fill="white" font-size="48" font-weight="bold">${category.name}</text></svg>`;
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <h3 className="text-white text-xl sm:text-2xl font-black mb-3">
                          {category.name}
                        </h3>
                        <Link
                          to={`/category/${category.name.toLowerCase()}`}
                          className="px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 hover:scale-105 transition-all text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Explore Recipes →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentCategoryIndex(
                    (prev) =>
                      (prev - 1 + categoryCards.length) % categoryCards.length,
                  )
                }
                className="absolute top-1/2 -translate-y-1/2 left-[-10px] sm:left-2 md:left-5 w-12 h-12 rounded-full bg-white shadow-2xl border-2 border-orange-200 flex justify-center items-center text-orange-500 hover:bg-orange-500 hover:text-white hover:scale-110 transition-all z-50"
                aria-label="Previous Category"
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              <button
                onClick={() =>
                  setCurrentCategoryIndex(
                    (prev) => (prev + 1) % categoryCards.length,
                  )
                }
                className="absolute top-1/2 -translate-y-1/2 right-[-10px] sm:right-2 md:right-5 w-12 h-12 rounded-full bg-white shadow-2xl border-2 border-orange-200 flex justify-center items-center text-orange-500 hover:bg-orange-500 hover:text-white hover:scale-110 transition-all z-50"
                aria-label="Next Category"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </section>

        {/* Featured Recipes Grid - Enhanced with Home page styling */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 p-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                Featured Recipes 👨‍🍳
              </h2>
              <p className="text-xl text-gray-600">
                Discover amazing recipes that match your taste
              </p>
            </div>

            {loadingRecipes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-2xl p-6 animate-pulse"
                  >
                    <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredFeatured.length > 0 ? (
                  filteredFeatured.slice(0, 9).map((recipe, index) => {
                    const rid = recipe?._id || recipe?.id;
                    const img =
                      recipe.imageUrl || recipe.pic || recipe.image || "";

                    return rid ? (
                      <Link
                        key={rid || recipe?.name}
                        to={`/recipes/${rid}`}
                        className="block h-full"
                      >
                        <article className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group border border-gray-100 hover:border-orange-300 cursor-pointer h-full flex flex-col relative">
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={img}
                              alt={recipe.name}
                              onError={(e) => {
                                e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f97316;stop-opacity:1" /><stop offset="100%" style="stop-color:%23ea580c;stop-opacity:1" /></linearGradient></defs><rect width="600" height="400" fill="url(%23grad)"/><text x="300" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="32" font-weight="bold">${recipe.name || "Recipe"}</text></svg>`;
                              }}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="absolute top-4 left-4">
                              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                                🍴 {recipe.category || "Recipe"}
                              </span>
                            </div>

                            <div className="absolute top-4 right-4 flex gap-2">
                              <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/95 backdrop-blur-md text-gray-900 text-sm font-bold shadow-lg">
                                <span className="text-yellow-500">⭐</span>
                                <span>4.8</span>
                              </div>

                              {/* Favorite Button */}
                              <button
                                onClick={(e) => toggleFavorite(rid, e)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-md ${
                                  favoriteRecipes.has(rid)
                                    ? "bg-red-500 text-white scale-105"
                                    : "bg-white/95 hover:bg-red-500 hover:text-white text-red-500"
                                }`}
                                title={
                                  favoriteRecipes.has(rid)
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                                }
                              >
                                <span className="text-xl">
                                  {favoriteRecipes.has(rid) ? "❤️" : "🤍"}
                                </span>
                              </button>
                            </div>

                            {/* Difficulty Badge */}
                            <div className="absolute bottom-4 left-4">
                              <span
                                className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                                  recipe.difficulty === "Easy"
                                    ? "bg-green-500 text-white"
                                    : recipe.difficulty === "Medium"
                                      ? "bg-yellow-500 text-white"
                                      : "bg-red-500 text-white"
                                }`}
                              >
                                {recipe.difficulty || "Easy"}
                              </span>
                            </div>
                          </div>

                          <div className="p-6">
                            <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight">
                              {recipe.name}
                            </h3>

                            {recipe.description ? (
                              <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                                {recipe.description}
                              </p>
                            ) : Array.isArray(recipe.ingredients) &&
                              recipe.ingredients.length ? (
                              <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                                <span className="font-bold text-orange-600">
                                  Ingredients:
                                </span>{" "}
                                {recipe.ingredients.slice(0, 3).join(", ")}
                                {recipe.ingredients.length > 3 && "..."}
                              </p>
                            ) : (
                              <p className="text-gray-500 mb-4 text-sm">
                                Delicious recipe waiting for you to try! 🍽️
                              </p>
                            )}

                            <div className="flex items-center gap-4 mb-5">
                              <div className="flex items-center gap-2 text-sm text-gray-700 bg-orange-50 px-3 py-2 rounded-xl">
                                <span className="text-orange-500">⏱️</span>
                                <span className="font-semibold">
                                  {(recipe.prepTime || 15) +
                                    (recipe.cookingTime ||
                                      recipe.cookTime ||
                                      15)}{" "}
                                  min
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700 bg-orange-50 px-3 py-2 rounded-xl">
                                <span className="text-orange-500">👥</span>
                                <span className="font-semibold">
                                  {recipe.servings || 4}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const shareUrl = `${window.location.origin}/recipes/${rid}`;
                                  if (navigator.share) {
                                    navigator
                                      .share({
                                        title: recipe.name,
                                        text:
                                          recipe.description ||
                                          "Check out this recipe!",
                                        url: shareUrl,
                                      })
                                      .catch(() => {});
                                  } else {
                                    navigator.clipboard.writeText(shareUrl);
                                    showSuccess("Link copied to clipboard! 📋");
                                  }
                                }}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-sm font-bold hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                                title="Share recipe"
                              >
                                <span>📤</span>
                                <span>Share</span>
                              </button>

                              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all">
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                    ) : (
                      <article
                        key={rid || recipe?.name}
                        className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-200 opacity-60 h-full flex flex-col"
                      >
                        <div className="relative h-48 mb-4 overflow-hidden rounded-xl bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-4xl">🍽️</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-600 mb-3">
                          {recipe.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Recipe details not available
                        </p>
                      </article>
                    );
                  })
                ) : (
                  <div className="col-span-full">
                    <div className="text-center p-12">
                      <div className="text-6xl mb-6">🔍</div>
                      <h3 className="text-3xl font-black text-gray-900 mb-4">
                        No recipes found
                      </h3>
                      <p className="text-xl text-gray-600 mb-8">
                        Try different keywords like{" "}
                        <span className="font-bold text-orange-600">
                          chicken
                        </span>
                        ,{" "}
                        <span className="font-bold text-orange-600">
                          dessert
                        </span>
                        , or select another category.
                      </p>
                      <button
                        onClick={() => {
                          setSearchText("");
                          setFilterCategory("All");
                          setSortBy("popular");
                        }}
                        className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 hover:scale-105 transition-all"
                      >
                        🔄 Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show More Button */}
            {filteredFeatured.length > 9 && (
              <div className="text-center mt-12">
                <button
                  onClick={applySearch}
                  className="px-12 py-4 rounded-2xl bg-orange-500 text-white text-lg font-black hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition-all"
                >
                  🔍 View All {filteredFeatured.length} Recipes
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
