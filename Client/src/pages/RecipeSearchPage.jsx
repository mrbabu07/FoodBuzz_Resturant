// path: src/pages/RecipeSearchPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const API_BASE = ""; // Use Vite proxy

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function normalize(str = "") {
  return String(str).toLowerCase().trim();
}

export default function RecipeSearchPage() {
  const qs = useQuery();
  const q = qs.get("q") || "";
  const category = qs.get("category") || "All";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const url = `${API_BASE}/api/recipes?q=${encodeURIComponent(q)}&category=${encodeURIComponent(
          category,
        )}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load");
        setRecipes(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Failed");
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [q, category]);

  const title = useMemo(() => {
    const parts = [];
    if (q) parts.push(`"${q}"`);
    if (category && category !== "All") parts.push(category);
    return parts.length ? parts.join(" • ") : "All Recipes";
  }, [q, category]);

  return (
    <main className="w-[95vw] max-w-[1700px] mx-auto mt-10 px-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Search Results</h1>
          <p className="text-sm text-gray-600 mt-1">Filter: {title}</p>
        </div>

        <Link
          to="/recipes"
          className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-black hover:text-white transition"
        >
          Back to Recipes
        </Link>
      </div>

      <section className="my-10">
        {loading ? (
          <div className="text-center text-gray-700">Loading...</div>
        ) : err ? (
          <div className="text-center text-red-600">{err}</div>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-6">
              Found{" "}
              <span className="font-extrabold text-orange-600">
                {recipes.length}
              </span>{" "}
              recipes
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
              {recipes.map((recipe) => {
                const rid = recipe?._id || recipe?.id;
                return (
                  <article
                    key={rid || recipe?.name}
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

                    <div className="absolute bottom-[-9rem] left-0 right-0 mx-auto bg-black/70 px-8 py-6 rounded-lg w-[280px] opacity-0 transition-all duration-[1000ms] ease-out group-hover:opacity-100 group-hover:bottom-5">
                      <span className="block text-sm text-white mb-1">
                        Category : {recipe.category}
                      </span>
                      <h2 className="text-2xl text-white mb-3">
                        {recipe.name}
                      </h2>

                      {Array.isArray(recipe.ingredients) &&
                      recipe.ingredients.length ? (
                        <p className="text-xs text-white/80 mb-4 line-clamp-2">
                          Ingredients: {recipe.ingredients.join(", ")}
                        </p>
                      ) : null}

                      {rid ? (
                        <Link
                          to={`/recipes/${rid}`}
                          className="inline-block bg-orange-500 text-white px-5 py-2 rounded hover:bg-orange-400 transition"
                        >
                          View Recipe
                        </Link>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>

            {!recipes.length && (
              <div className="w-full max-w-3xl mx-auto text-center mt-10">
                <div className="rounded-3xl border border-orange-200 bg-orange-50 p-8">
                  <h3 className="text-2xl font-extrabold text-orange-700">
                    No recipes found 😅
                  </h3>
                  <p className="text-gray-700 mt-2">
                    Try different keyword or change category.
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
