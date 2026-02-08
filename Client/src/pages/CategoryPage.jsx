// pages/CategoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import data from "../data/CategoryData.json";
import "../styles/Category.css";

const API_BASE = ""; // Use Vite proxy

function normalize(str = "") {
  return String(str).toLowerCase().trim();
}

export default function CategoryPage() {
  const { categoryName } = useParams();

  // ✅ banner/description/menu from JSON
  const category = useMemo(() => {
    if (!categoryName) return null;
    return data[categoryName.toLowerCase()] || null;
  }, [categoryName]);

  // ✅ recipes from backend (MongoDB)
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        // works even if your backend doesn't support query params
        const res = await fetch(`${API_BASE}/api/recipes`);
        const all = await res.json();
        const arr = Array.isArray(all) ? all : [];

        const filtered = arr.filter(
          (r) => normalize(r?.category) === normalize(categoryName),
        );

        setRecipes(filtered);
      } catch (e) {
        setErr(e?.message || "Failed to load recipes");
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [categoryName]);

  if (!category) {
    return (
      <div className="text-center mt-20 text-red-600 text-3xl">
        Category not found
      </div>
    );
  }

  return (
    <main className="bg-white">
      {/* Section 1 */}
      <header className="relative h-[40vh] rounded-[40px] md:rounded-[60px] lg:rounded-[80px] overflow-hidden bg-black max-w-[1700px] mx-auto mt-6 px-4 md:px-6">
        <img
          src={category.bannerImage}
          alt={categoryName}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center text-white drop-shadow-md max-w-md md:max-w-xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold capitalize mb-2">
              {categoryName}:
            </h1>
            <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl">
              {category.description}
            </h2>
          </div>
        </div>
      </header>

      {/* Menu Bar */}
      <nav className="mt-12 flex flex-wrap justify-center bg-[#fafafa] rounded-xl shadow-[0_0_100px_rgb(247,105,40)] py-3 px-6 text-sm font-semibold gap-4 max-w-[1700px] mx-auto">
        {Object.keys(data).map((cat) => (
          <Link
            key={cat}
            to={`/category/${cat}`}
            className={`px-3 py-1 rounded-md hover:bg-black hover:text-white transition whitespace-nowrap
            ${
              categoryName && categoryName.toLowerCase() === cat.toLowerCase()
                ? "font-bold bg-black text-white"
                : "text-orange-600"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Link>
        ))}
      </nav>

      {/* Recipes Section */}
      <section className="my-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center max-w-[1800px] mx-auto px-6">
        <h2 className="col-span-full text-6xl mb-24 text-orange-500 drop-shadow-[1px_-2px_20px_rgb(241_126_21)] text-center select-none capitalize">
          {categoryName} based Recipes
        </h2>

        {loading ? (
          <div className="col-span-full text-center text-gray-700">
            Loading recipes...
          </div>
        ) : err ? (
          <div className="col-span-full text-center text-red-600">{err}</div>
        ) : (
          <>
            {recipes.map((recipe) => (
              <article
                key={recipe._id}
                className="relative rounded-xl shadow-lg overflow-hidden group"
              >
                <img
                  src={recipe.imageUrl || recipe.pic || recipe.image || ""}
                  alt={recipe.name}
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(
                      recipe.name || "Recipe",
                    )}`;
                  }}
                  className="w-[328px] h-[240px] rounded-xl object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                />

                <div className="absolute bottom-[-9rem] left-0 right-0 mx-auto bg-black/70 px-8 py-6 rounded-lg w-[280px] opacity-0 transition-all duration-[1000ms] ease-out group-hover:opacity-100 group-hover:bottom-5 shadow-[0_4px_15px_rgba(247,105,40,0.7)]">
                  <span className="block text-sm text-white mb-1">
                    Category : {recipe.category || categoryName}
                  </span>
                  <h2 className="text-2xl text-white mb-4">{recipe.name}</h2>

                  {Array.isArray(recipe.ingredients) &&
                  recipe.ingredients.length ? (
                    <p className="text-xs text-white/80 mb-4 line-clamp-2">
                      Ingredients: {recipe.ingredients.join(", ")}
                    </p>
                  ) : null}

                  {/* ✅ IMPORTANT: App.jsx uses /recipes/:id */}
                  <Link
                    to={`/recipes/${recipe._id}`}
                    className="inline-block bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-400 transition"
                  >
                    View Recipe
                  </Link>
                </div>
              </article>
            ))}

            {!recipes.length && (
              <div className="col-span-full w-full max-w-3xl mx-auto text-center mt-6">
                <div className="rounded-3xl border border-orange-200 bg-orange-50 p-8">
                  <h3 className="text-2xl font-extrabold text-orange-700">
                    No recipes found 😅
                  </h3>
                  <p className="text-gray-700 mt-2">
                    Try another category from the menu above.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
