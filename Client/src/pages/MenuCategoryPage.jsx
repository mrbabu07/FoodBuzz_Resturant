// path: src/pages/MenuCategoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_BASE = ""; // Use Vite proxy

function capCategory(cat = "") {
  const x = String(cat).trim().toLowerCase();
  if (!x) return "";
  return x.charAt(0).toUpperCase() + x.slice(1);
}

const FIXED_CATS = ["chicken", "beef", "fish", "soup", "dessert", "drink"];

const MenuCategoryPage = () => {
  const { menuCategory } = useParams(); // url: /order/category/:menuCategory  (lowercase expected)
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [quantities, setQuantities] = useState({});
  const { cartItems, addToCart } = useCart();
  const [slideCartVisible, setSlideCartVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const cat = menuCategory ? capCategory(menuCategory) : "All";
        const url = `${API_BASE}/api/menu-items?category=${encodeURIComponent(cat)}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load items");

        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Failed");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [menuCategory]);

  const increaseQty = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  };

  const decreaseQty = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 1 ? prev[id] - 1 : 1,
    }));
  };

  const handleAddToCart = (it) => {
    const qty = quantities[it._id] || 1;

    addToCart(
      { menuItemId: it._id, name: it.name, price: it.price, img: it.imageUrl },
      qty,
    );

    setSlideCartVisible(true);
    setTimeout(() => setSlideCartVisible(false), 2000);
  };

  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const title = useMemo(() => capCategory(menuCategory || ""), [menuCategory]);

  return (
    <div className="bg-white text-black font-sans w-full min-h-screen relative">
      {/* Header */}
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-4 max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-2xl">
          <i className="fas fa-arrow-left"></i>
        </button>

        <Link
          to="/cart"
          className="text-2xl hover:text-orange-600 transition relative"
        >
          <i className="fas fa-shopping-cart"></i>
          {totalCartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {totalCartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Banner (simple) */}
      <section
        className="relative w-full h-[240px] sm:h-[320px] md:h-[400px] bg-center bg-cover rounded-lg shadow-lg overflow-hidden px-4"
        style={{
          backgroundImage: `url('https://i.ibb.co/7xV4zn0w/chicken.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-16 text-white max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
            {title || "Menu"}
          </h1>
          <p className="text-xs sm:text-sm md:text-lg drop-shadow-md">
            Browse items and add to cart.
          </p>
        </div>
      </section>

      {/* Category Navigation */}
      <nav className="mt-8 flex flex-wrap justify-center bg-[#fafafa] rounded-xl shadow-[0_0_100px_rgb(247,105,40)] py-3 px-4 sm:px-6 md:px-8 text-sm font-semibold gap-4 sm:gap-6 max-w-[1700px] mx-auto">
        {FIXED_CATS.map((cat) => (
          <Link
            key={cat}
            to={`/order/category/${cat}`}
            className={`text-orange-600 px-3 py-1 rounded-md hover:bg-black hover:text-white transition whitespace-nowrap ${
              cat === String(menuCategory || "").toLowerCase()
                ? "bg-black text-white"
                : ""
            }`}
          >
            {capCategory(cat)}
          </Link>
        ))}
      </nav>

      {/* Items */}
      <section className="my-8 px-4 sm:px-6 md:px-8 w-full max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-orange-600 text-center mb-6">
          {title} Items
        </h2>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : err ? (
          <div className="text-center text-red-600">{err}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 place-items-center">
            {items.map((it) => {
              const slug = it.name.toLowerCase().replace(/\s+/g, "-");
              const qty = quantities[it._id] || 1;

              return (
                <div
                  key={it._id}
                  className="relative group transform transition duration-300 hover:scale-[1.03] cursor-pointer w-full max-w-[360px]"
                >
                  <img
                    src={
                      it.imageUrl ||
                      "https://via.placeholder.com/600x400?text=Menu"
                    }
                    alt={it.name}
                    className="w-full h-48 sm:h-56 md:h-60 object-cover rounded-xl shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/600x400?text=${encodeURIComponent(
                        it.name || "Menu",
                      )}`;
                    }}
                  />

                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] sm:w-[300px] bg-black/80 text-white px-5 py-4 rounded-lg opacity-0 translate-y-12 group-hover:translate-y-[-1rem] group-hover:opacity-100 transition-all duration-500">
                    <h3 className="text-lg sm:text-xl font-semibold mb-1">
                      {it.name}
                    </h3>
                    <p className="text-xs sm:text-sm mb-3">
                      TK{Number(it.price || 0).toFixed(2)}
                    </p>

                    <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                      <button
                        onClick={() => increaseQty(it._id)}
                        className="bg-orange-500 text-white text-xs sm:text-sm px-3 py-1 rounded hover:bg-orange-600 transition"
                      >
                        +
                      </button>

                      <span className="px-2 py-1 bg-white text-black rounded text-xs sm:text-sm select-none min-w-[24px] text-center">
                        {qty}
                      </span>

                      <button
                        onClick={() => decreaseQty(it._id)}
                        className="bg-orange-500 text-white text-xs sm:text-sm px-3 py-1 rounded hover:bg-orange-600 transition"
                      >
                        -
                      </button>

                      <button
                        onClick={() => handleAddToCart(it)}
                        className="bg-black text-white px-4 py-1 rounded hover:bg-gray-800 transition text-xs sm:text-sm ml-auto"
                      >
                        Add
                      </button>

                      <Link
                        to={`/menu/${slug}`}
                        className="bg-white text-black px-2 py-1 rounded hover:bg-orange-500 hover:text-white transition text-xs sm:text-sm"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {!items.length && (
              <div className="col-span-full text-center text-gray-600">
                No items found in this category.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Slide-in Notification */}
      <div
        className={`fixed top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-50 select-none transition-all duration-500 ${
          slideCartVisible
            ? "translate-x-0 opacity-100"
            : "-translate-x-40 opacity-0"
        }`}
      >
        <span className="material-icons text-lg">shopping_cart</span>
        <span className="font-semibold">Added</span>
      </div>
    </div>
  );
};

export default MenuCategoryPage;
