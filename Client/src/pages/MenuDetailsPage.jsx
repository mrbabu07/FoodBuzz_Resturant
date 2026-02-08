// path: src/pages/MenuDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import SocialShare from "../components/SocialShare";
import FavoriteButton from "../components/FavoriteButton";

const API_BASE = ""; // Use Vite proxy

const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function MenuDetailsPage() {
  const { menuItemName } = useParams(); // slug
  const navigate = useNavigate();

  const { cartItems, addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${API_BASE}/api/menu-items`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to load menu items");
        setAllItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Failed");
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const foundItem = useMemo(() => {
    const slug = String(menuItemName || "").toLowerCase();
    return allItems.find((it) => slugify(it.name) === slug) || null;
  }, [allItems, menuItemName]);

  const youMayAlsoLike = useMemo(() => {
    if (!foundItem) return [];
    const others = allItems.filter((i) => i._id !== foundItem._id);
    return others.sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [allItems, foundItem]);

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const [qty, setQty] = useState(1);
  const inc = () => setQty((p) => p + 1);
  const dec = () => setQty((p) => (p > 1 ? p - 1 : 1));

  const [youMayQty, setYouMayQty] = useState({});
  const incYM = (id) => setYouMayQty((p) => ({ ...p, [id]: (p[id] || 1) + 1 }));
  const decYM = (id) =>
    setYouMayQty((p) => ({ ...p, [id]: p[id] > 1 ? p[id] - 1 : 1 }));

  const [showSlide, setShowSlide] = useState(false);

  const addMain = () => {
    if (!foundItem) return;
    addToCart(
      {
        menuItemId: foundItem._id,
        name: foundItem.name,
        price: foundItem.price,
        img: foundItem.imageUrl,
      },
      qty,
    );
    setShowSlide(true);
    setTimeout(() => setShowSlide(false), 2000);
  };

  const addYM = (it) => {
    const q = youMayQty[it._id] || 1;
    addToCart(
      { menuItemId: it._id, name: it.name, price: it.price, img: it.imageUrl },
      q,
    );
    setShowSlide(true);
    setTimeout(() => setShowSlide(false), 2000);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Loading...</div>;
  }

  if (err) {
    return <div className="p-10 text-center text-red-600">{err}</div>;
  }

  if (!foundItem) {
    return (
      <div className="p-10 text-center text-red-600 font-semibold">
        Item not found.{" "}
        <button className="underline" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl hover:text-orange-600 transition"
        >
          <i className="fas fa-arrow-left"></i>
        </button>

        <Link
          to="/cart"
          className="relative text-2xl hover:text-orange-600 transition"
        >
          <i className="fas fa-shopping-cart"></i>
          {totalCartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {totalCartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Product */}
      <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-2 gap-6">
        <div className="flex justify-center items-center">
          <img
            src={
              foundItem.imageUrl ||
              "https://via.placeholder.com/700x450?text=Menu"
            }
            alt={foundItem.name}
            className="w-full max-w-[520px] h-[320px] object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = `https://via.placeholder.com/700x450?text=${encodeURIComponent(
                foundItem.name || "Menu",
              )}`;
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">{foundItem.name}</h2>
            <FavoriteButton itemId={foundItem._id} type="menu-item" />
          </div>
          <p className="text-xl font-bold text-green-700">
            TK{Number(foundItem.price || 0).toFixed(2)}
          </p>
          <p className="text-gray-600">
            {foundItem.details || "No details available."}
          </p>
          <p className="text-gray-600 font-semibold">
            Calories: {Number(foundItem.calories || 0)} kcal
          </p>

          {/* Social Share */}
          <div className="pt-2 pb-2">
            <SocialShare
              title={`${foundItem.name} - FoodBuzz Menu`}
              description={
                foundItem.details ||
                `Delicious ${foundItem.category} dish for only TK${foundItem.price}!`
              }
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center border rounded overflow-hidden">
              <button
                onClick={dec}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
              >
                -
              </button>
              <input
                type="text"
                value={qty}
                readOnly
                className="w-10 text-center border-x outline-none"
              />
              <button
                onClick={inc}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
              >
                +
              </button>
            </div>

            <button
              onClick={addMain}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded flex items-center gap-2"
            >
              <i className="fas fa-shopping-bag"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* You may also like */}
      <div className="max-w-6xl mx-auto px-4 mt-12 mb-15">
        <h3 className="text-2xl font-semibold mb-4">You may also like</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {youMayAlsoLike.map((it) => {
            const itemSlug = slugify(it.name);
            const q = youMayQty[it._id] || 1;

            return (
              <div
                key={it._id}
                className="relative group transition hover:scale-[1.02] w-full max-w-[320px] mx-auto cursor-pointer"
              >
                <img
                  src={
                    it.imageUrl ||
                    "https://via.placeholder.com/600x400?text=Menu"
                  }
                  alt={it.name}
                  className="w-full h-52 object-cover rounded-xl shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(
                      it.name || "Menu",
                    )}`;
                  }}
                />

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] bg-black/80 text-white px-4 py-3 rounded-lg opacity-0 translate-y-10 group-hover:translate-y-[-1rem] group-hover:opacity-100 transition-all duration-500">
                  <h3 className="text-lg font-semibold mb-1">{it.name}</h3>
                  <p className="text-xs mb-3">
                    TK{Number(it.price || 0).toFixed(2)}
                  </p>

                  <div className="flex gap-2 items-center flex-nowrap overflow-hidden">
                    <button
                      onClick={() => incYM(it._id)}
                      className="bg-orange-500 text-white text-xs px-3 py-1 rounded hover:bg-orange-600 transition"
                    >
                      +
                    </button>
                    <span className="px-2 py-1 bg-white text-black rounded text-xs select-none">
                      {q}
                    </span>
                    <button
                      onClick={() => decYM(it._id)}
                      className="bg-orange-500 text-white text-xs px-3 py-1 rounded hover:bg-orange-600 transition"
                    >
                      -
                    </button>

                    <button
                      onClick={() => addYM(it)}
                      className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition text-xs"
                    >
                      Add
                    </button>

                    <Link
                      to={`/menu/${itemSlug}`}
                      className="bg-white text-black px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition text-xs"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-in */}
      <div
        className={`fixed top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-50 transition-all duration-500 select-none
          ${showSlide ? "translate-x-0 opacity-100" : "-translate-x-40 opacity-0"}`}
      >
        <span className="material-icons text-lg">shopping_cart</span>
        <span className="font-semibold">Added</span>
      </div>
    </div>
  );
}
