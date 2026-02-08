import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import {
  showFavoriteAdded,
  showFavoriteRemoved,
  showError,
} from "../utils/toast";

export default function FavoriteButton({ itemId, type = "recipe" }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemId) {
      checkFavoriteStatus();
    }
  }, [itemId]);

  const checkFavoriteStatus = async () => {
    if (!itemId) return;

    try {
      const endpoint =
        type === "recipe"
          ? `/api/favorites/recipes/check/${itemId}`
          : `/api/favorites/menu-items/check/${itemId}`;

      const data = await apiFetch(endpoint);
      setIsFavorite(data.isFavorite || data.isInWishlist || false);
    } catch (err) {
      // User might not be logged in, that's okay
      console.log("Not logged in or error checking favorite");
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!itemId) {
      showError("Invalid item");
      return;
    }

    try {
      setLoading(true);

      const endpoint =
        type === "recipe"
          ? `/api/favorites/recipes/${itemId}`
          : `/api/favorites/menu-items/${itemId}`;

      if (isFavorite) {
        await apiFetch(endpoint, { method: "DELETE" });
        setIsFavorite(false);
        showFavoriteRemoved();
      } else {
        await apiFetch(endpoint, { method: "POST" });
        setIsFavorite(true);
        showFavoriteAdded();
      }
    } catch (err) {
      showError(err.message || "Please login to add favorites");
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no itemId
  if (!itemId) {
    return null;
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-all transform hover:scale-110 ${
        isFavorite
          ? "bg-red-500 text-white shadow-lg"
          : "bg-white text-gray-400 hover:text-red-500 border-2 border-gray-200"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        className="w-6 h-6"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
