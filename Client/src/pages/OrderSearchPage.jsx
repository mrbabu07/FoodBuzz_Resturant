// path: src/pages/OrderSearchPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE = ""; // Use Vite proxy

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}
function capCategory(cat = "") {
  const x = String(cat).trim().toLowerCase();
  if (!x) return "";
  return x.charAt(0).toUpperCase() + x.slice(1);
}
const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function OrderSearchPage() {
  const qs = useQuery();
  const q = qs.get("q") || "";
  const category = qs.get("category") || "All";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  const { cartItems, addToCart } = useCart();
  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const url = `${API_BASE}/api/menu-items?search=${encodeURIComponent(q)}&category=${encodeURIComponent(
          category === "All" ? "All" : capCategory(category),
        )}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load");
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Failed");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [q, category]);

  return (
    <main className="w-[95vw] max-w-[1700px] mx-auto mt-10 px-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">
            Order Search Results
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            q: <b>{q || "—"}</b> • category: <b>{category}</b>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/order"
            className="px-4 py-2 rounded-xl border hover:bg-black hover:text-white transition"
          >
            Back to Order
          </Link>
          <Link
            to="/cart"
            className="relative px-4 py-2 rounded-xl border hover:bg-black hover:text-white transition"
          >
            Cart
            <span className="ml-2 inline-flex items-center justify-center bg-orange-600 text-white rounded-full w-6 h-6 text-xs font-bold">
              {totalCartCount}
            </span>
          </Link>
        </div>
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
                {items.length}
              </span>{" "}
              items
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
              {items.map((it) => (
                <article
                  key={it._id}
                  className="relative rounded-xl shadow-lg overflow-hidden group"
                >
                  <img
                    src={
                      it.imageUrl ||
                      "https://via.placeholder.com/600x400?text=Menu"
                    }
                    alt={it.name}
                    className="w-[328px] h-[240px] rounded-xl object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(
                        it.name || "Menu",
                      )}`;
                    }}
                  />

                  <div className="absolute bottom-[-9rem] left-0 right-0 mx-auto bg-black/70 px-8 py-6 rounded-lg w-[280px] opacity-0 transition-all duration-[1000ms] ease-out group-hover:opacity-100 group-hover:bottom-5">
                    <span className="block text-xs text-white/80 mb-1">
                      Category: {it.category}
                    </span>
                    <h2 className="text-2xl text-white mb-2">{it.name}</h2>
                    <p className="text-sm text-white mb-3">
                      TK{Number(it.price || 0).toFixed(2)}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          addToCart(
                            {
                              menuItemId: it._id,
                              name: it.name,
                              price: it.price,
                              img: it.imageUrl,
                            },
                            1,
                          )
                        }
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition text-sm"
                      >
                        Add
                      </button>

                      <Link
                        to={`/menu/${slugify(it.name)}`}
                        className="bg-white text-black px-4 py-2 rounded hover:bg-orange-500 hover:text-white transition text-sm"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!items.length && (
              <div className="w-full max-w-3xl mx-auto text-center mt-10">
                <div className="rounded-3xl border border-orange-200 bg-orange-50 p-8">
                  <h3 className="text-2xl font-extrabold text-orange-700">
                    No items found 😅
                  </h3>
                  <p className="text-gray-700 mt-2">
                    Try different keyword / category.
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
