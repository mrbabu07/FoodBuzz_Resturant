//pages/RecipeDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SocialShare from "../components/SocialShare";
import FavoriteButton from "../components/FavoriteButton";

const API_BASE = ""; // Use Vite proxy

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function RecipeDetailsPage() {
  const { id } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [cookingProgress, setCookingProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isCooking, setIsCooking] = useState(false);

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

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/api/recipes/${id}`);
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Failed to load recipe");
        }
        const data = await res.json();
        setRecipe(data);

        // Fetch related recipes
        try {
          const relatedRes = await fetch(`${API_BASE}/api/recipes`);
          if (relatedRes.ok) {
            const allRecipes = await relatedRes.json();
            const related = allRecipes
              .filter((r) => r._id !== data._id && r.category === data.category)
              .slice(0, 3);
            setRelatedRecipes(related);
          }
        } catch (e) {
          console.log("Failed to fetch related recipes:", e);
        }
      } catch (e) {
        setErr(e?.message || "Something went wrong");
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const imageSrc = useMemo(() => {
    if (!recipe) return "";
    // support both "pic" and "imageUrl"
    return recipe.pic || recipe.imageUrl || "";
  }, [recipe]);

  const prepTime = safeNum(recipe?.prepTime, 0);
  const cookingTime = safeNum(recipe?.cookingTime, 0);
  const totalTime = prepTime + cookingTime;
  const servings = safeNum(recipe?.servings, 0);
  const calories = safeNum(recipe?.calories, 0);

  if (loading) {
    return (
      <div className="bg-white w-full relative min-h-screen">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 px-4 text-center text-sm font-semibold">
          <div className="flex justify-center items-center gap-4">
            <span>🔄 Loading Recipe...</span>
          </div>
        </div>

        <div className="container-custom py-20">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Loading delicious recipe... 🍳
            </h2>
            <p className="text-gray-600">
              Preparing the perfect cooking instructions for you
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="bg-white w-full relative min-h-screen">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 text-center text-sm font-semibold">
          <div className="flex justify-center items-center gap-4">
            <span>⚠️ Recipe Error</span>
          </div>
        </div>

        <div className="container-custom py-20">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-100 p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">😞</div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-8">{err}</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/recipes"
                className="px-8 py-4 rounded-2xl bg-gray-500 text-white font-bold hover:bg-gray-600 hover:scale-105 transition-all"
              >
                ← Back to Recipes
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 hover:scale-105 transition-all"
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="bg-white w-full relative min-h-screen">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 px-4 text-center text-sm font-semibold">
          <div className="flex justify-center items-center gap-4">
            <span>🔍 Recipe Not Found</span>
          </div>
        </div>

        <div className="container-custom py-20">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Recipe Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              We couldn't find the recipe you're looking for.
            </p>
            <Link
              to="/recipes"
              className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 hover:scale-105 transition-all"
            >
              ← Back to Recipes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full relative min-h-screen">
      {/* Dynamic Status Bar - Same as Home */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 px-4 text-center text-sm font-semibold">
        <div className="flex justify-center items-center gap-4 flex-wrap">
          <span>{getGreeting()}</span>
          <span>•</span>
          <span>🕐 {currentTime.toLocaleTimeString()}</span>
          <span>•</span>
          <span>👨‍🍳 {recipe.category} Recipe</span>
          <span>•</span>
          <span>⏱️ {totalTime} min total time</span>
        </div>
      </div>

      <div className="container-custom py-10 relative">
        {/* Top bar - Enhanced */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                  {recipe.name} 🍽️
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    {recipe.category || "Recipe"}
                  </span>
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    {recipe.difficulty || "Easy"}
                  </span>
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    ⭐ 4.8 Rating
                  </span>
                </div>
              </div>
              <FavoriteButton itemId={recipe._id} type="recipe" />
            </div>

            <div className="flex gap-3">
              <Link
                to="/recipes"
                className="px-6 py-3 rounded-2xl bg-gray-500 text-white font-bold hover:bg-gray-600 hover:scale-105 transition-all"
              >
                ← Back to Recipes
              </Link>
            </div>
          </div>
        </div>

        {/* Social Share - Enhanced */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8 mb-8">
          <h3 className="text-2xl font-black text-orange-600 mb-4 flex items-center gap-2">
            <span>📤</span> Share this Recipe
          </h3>
          <SocialShare
            title={`${recipe.name} - FoodBuzz Recipe`}
            description={
              recipe.description ||
              `Check out this amazing ${recipe.category} recipe!`
            }
          />
        </div>

        {/* Hero Section - Enhanced */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl border-2 border-orange-100 overflow-hidden">
            <div className="h-80 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-2">🍳</div>
                  <p className="text-gray-500">No Image Available</p>
                </div>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-3 flex items-center gap-2">
                <span>📖</span> Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {recipe.description ||
                  "No description added yet. This recipe is waiting for its story!"}
              </p>
            </div>
          </div>

          {/* Stats card */}
          <aside className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8">
            <h3 className="text-xl font-black text-orange-600 mb-4 flex items-center gap-2">
              <span>⏱️</span> Quick Info
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600 flex items-center gap-2">
                  <span>🔪</span> Prep Time
                </span>
                <span className="font-bold text-orange-600">
                  {prepTime} min
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600 flex items-center gap-2">
                  <span>🍳</span> Cooking Time
                </span>
                <span className="font-bold text-orange-600">
                  {cookingTime} min
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                <span className="text-gray-800 font-semibold flex items-center gap-2">
                  <span>⏰</span> Total Time
                </span>
                <span className="font-bold text-orange-700">
                  {totalTime} min
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600 flex items-center gap-2">
                  <span>👥</span> Servings
                </span>
                <span className="font-bold text-orange-600">
                  {servings || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600 flex items-center gap-2">
                  <span>🔥</span> Calories
                </span>
                <span className="font-bold text-orange-600">
                  {calories || "—"}
                </span>
              </div>
            </div>
          </aside>
        </section>

        {/* Details grids */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Ingredients */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-green-100 p-8">
            <h3 className="text-xl font-black text-green-600 mb-4 flex items-center gap-2">
              <span>🥕</span> Ingredients
            </h3>
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length ? (
              <ul className="space-y-2">
                {recipe.ingredients.map((x, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-all"
                  >
                    <span className="text-green-500 font-bold">✓</span>
                    <span className="text-gray-700">{x}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-gray-500">No ingredients added yet.</p>
              </div>
            )}
          </div>

          {/* Tools */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-8">
            <h3 className="text-xl font-black text-blue-600 mb-4 flex items-center gap-2">
              <span>🔧</span> Tools
            </h3>
            {Array.isArray(recipe.tools) && recipe.tools.length ? (
              <ul className="space-y-2">
                {recipe.tools.map((x, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    <span className="text-blue-500 font-bold">🛠️</span>
                    <span className="text-gray-700">{x}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔨</div>
                <p className="text-gray-500">No tools added yet.</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-purple-100 p-8">
            <h3 className="text-xl font-black text-purple-600 mb-4 flex items-center gap-2">
              <span>👨‍🍳</span> Instructions
            </h3>
            {Array.isArray(recipe.instructions) &&
            recipe.instructions.length ? (
              <ol className="space-y-3">
                {recipe.instructions.map((x, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
                  >
                    <span className="flex-shrink-0 w-7 h-7 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 pt-0.5">{x}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-500">No instructions added yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Related Recipes */}
        {relatedRecipes.length > 0 && (
          <section className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8">
            <h3 className="text-2xl font-black text-orange-600 mb-6 flex items-center gap-2">
              <span>🍽️</span> More {recipe.category} Recipes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedRecipes.map((relatedRecipe) => (
                <Link
                  key={relatedRecipe._id}
                  to={`/recipes/${relatedRecipe._id}`}
                  className="bg-orange-50 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group border-2 border-orange-100 hover:border-orange-300"
                >
                  <img
                    src={relatedRecipe.imageUrl}
                    alt={relatedRecipe.name}
                    className="w-full h-32 object-cover rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="128" viewBox="0 0 200 128"><rect width="200" height="128" fill="%23f97316"/><text x="100" y="64" text-anchor="middle" dy=".3em" fill="white" font-size="16" font-weight="bold">🍽️</text></svg>`;
                    }}
                  />
                  <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">
                    {relatedRecipe.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    ⏱️{" "}
                    {(relatedRecipe.prepTime || 15) +
                      (relatedRecipe.cookTime || 15)}{" "}
                    min
                  </p>
                  <div className="text-orange-600 font-bold text-sm">
                    View Recipe →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
