import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { showError } from "../utils/toast";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recipes"); // "recipes" or "menu-items"
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const [recipes, menuItems] = await Promise.all([
        apiFetch("/api/favorites/recipes"),
        apiFetch("/api/favorites/menu-items"),
      ]);

      setFavoriteRecipes(recipes || []);
      setWishlistItems(menuItems || []);
    } catch (err) {
      setError(err.message || "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const removeFavoriteRecipe = async (id) => {
    if (!id) {
      showError("Invalid recipe ID");
      return;
    }
    try {
      await apiFetch(`/api/favorites/recipes/${id}`, { method: "DELETE" });
      setFavoriteRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      showError(err.message || "Failed to remove from favorites");
    }
  };

  const removeWishlistItem = async (id) => {
    if (!id) {
      showError("Invalid item ID");
      return;
    }
    try {
      await apiFetch(`/api/favorites/menu-items/${id}`, { method: "DELETE" });
      setWishlistItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      showError(err.message || "Failed to remove from wishlist");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-orange-600 text-xl font-semibold">
              Loading favorites...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent mb-4">
            ❤️ My Favorites
          </h1>
          <p className="text-gray-600 text-lg">
            Your saved recipes and wishlist items
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("recipes")}
            className={`px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 ${
              activeTab === "recipes"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "bg-white text-orange-600 border-2 border-orange-300 hover:bg-orange-50"
            }`}
          >
            📖 Recipes ({favoriteRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab("menu-items")}
            className={`px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 ${
              activeTab === "menu-items"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "bg-white text-orange-600 border-2 border-orange-300 hover:bg-orange-50"
            }`}
          >
            🍽️ Menu Items ({wishlistItems.length})
          </button>
        </div>

        {/* Recipes Tab */}
        {activeTab === "recipes" && (
          <div>
            {favoriteRecipes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-xl border-2 border-orange-200">
                <div className="text-8xl mb-6">📖</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  No Favorite Recipes Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start adding recipes to your favorites!
                </p>
                <Link
                  to="/recipe"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-full hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  Browse Recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRecipes
                  .filter((recipe) => recipe && recipe._id)
                  .map((recipe) => (
                    <div
                      key={recipe._id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-orange-100 group"
                    >
                      <div className="relative">
                        <img
                          src={
                            recipe.imageUrl ||
                            recipe.pic ||
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
                          }
                          alt={recipe.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <button
                          onClick={() => removeFavoriteRecipe(recipe._id)}
                          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-all"
                          title="Remove from favorites"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <div className="absolute bottom-3 left-3">
                          <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                            {recipe.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                          {recipe.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {recipe.description || "Delicious recipe"}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>
                            ⏱️{" "}
                            {(recipe.prepTime || 0) + (recipe.cookingTime || 0)}{" "}
                            min
                          </span>
                          <span>🍽️ {recipe.servings || 1} servings</span>
                          <span>🔥 {recipe.calories || 0} cal</span>
                        </div>
                        <Link
                          to={`/recipe/${recipe._id}`}
                          className="block w-full text-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all"
                        >
                          View Recipe
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Menu Items Tab */}
        {activeTab === "menu-items" && (
          <div>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-xl border-2 border-orange-200">
                <div className="text-8xl mb-6">🍽️</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  No Wishlist Items Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start adding menu items to your wishlist!
                </p>
                <Link
                  to="/order_1st_page"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-full hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems
                  .filter((item) => item && item._id)
                  .map((item) => (
                    <div
                      key={item._id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-orange-100 group"
                    >
                      <div className="relative">
                        <img
                          src={
                            item.imageUrl ||
                            item.pic ||
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
                          }
                          alt={item.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <button
                          onClick={() => removeWishlistItem(item._id)}
                          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-all"
                          title="Remove from wishlist"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <div className="absolute bottom-3 left-3">
                          <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                            {item.category}
                          </span>
                        </div>
                        {!item.isAvailable && (
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                              Unavailable
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.details || "Delicious menu item"}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-extrabold text-orange-600">
                            TK {item.price}
                          </span>
                          <span className="text-sm text-gray-500">
                            🔥 {item.calories || 0} cal
                          </span>
                        </div>
                        <Link
                          to={`/menu/${item._id}`}
                          className="block w-full text-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
