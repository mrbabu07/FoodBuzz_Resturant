// Reviews Page - View and write reviews
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";
import { apiFetch } from "../utils/api";
import { getUser } from "../utils/authStorage";

export default function ReviewsPage() {
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    if (userData) {
      fetchMyReviews();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/reviews/my");
      setMyReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await apiFetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      showSuccess("Review deleted successfully");
      fetchMyReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      showError("Error deleting review");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center px-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-100 p-12 text-center max-w-md">
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600 mb-8">
            Please login to view and write reviews
          </p>
          <Link
            to="/login"
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-amber-600 hover:scale-105 transition-all inline-block"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl">
              ⭐
            </div>
            <div>
              <p className="text-orange-100 text-sm font-semibold">
                Your Feedback
              </p>
              <h1 className="text-4xl md:text-5xl font-black">My Reviews</h1>
            </div>
          </div>
          <p className="text-orange-100 text-lg max-w-2xl">
            View and manage all your reviews for menu items and recipes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                How to Write Reviews
              </h3>
              <p className="text-gray-600 mb-4">
                You can write reviews after placing an order or trying a recipe.
                Your feedback helps others make better choices!
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/order_1st"
                  className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
                >
                  Order Food
                </Link>
                <Link
                  to="/recipes"
                  className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all"
                >
                  Browse Recipes
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
            </div>
            <p className="text-slate-800 text-2xl font-black">
              Loading reviews...
            </p>
          </div>
        ) : myReviews.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-20 text-center">
            <div className="text-8xl mb-6">📝</div>
            <h3 className="text-3xl font-black text-slate-800 mb-4">
              No Reviews Yet
            </h3>
            <p className="text-slate-600 text-lg mb-8">
              Start by ordering food or trying our recipes, then share your
              experience!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/order_1st"
                className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 hover:scale-105 transition-all"
              >
                Order Now
              </Link>
              <Link
                to="/recipes"
                className="px-8 py-4 bg-white border-2 border-orange-500 text-orange-600 font-bold rounded-xl hover:bg-orange-50 hover:scale-105 transition-all"
              >
                Browse Recipes
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myReviews.map((review) => (
              <div
                key={review._id}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 mb-2">
                        {review.menuItemName || "Recipe Review"}
                      </h3>
                      {renderStars(review.rating)}
                    </div>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                      "{review.comment}"
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      📅 {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {review.orderId && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
