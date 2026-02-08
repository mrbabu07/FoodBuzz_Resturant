import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { showSuccess, showError } from "../utils/toast";
import { getToken } from "../utils/authStorage";

const API_BASE = "http://localhost:5000";

const CATEGORIES = [
  "All",
  "Appetizers",
  "Main Course",
  "Desserts",
  "Beverages",
  "Salads",
  "Soups",
  "Sides",
  "Specials",
];

export default function ManageMenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    pic: "",
    name: "",
    category: "",
    price: "",
    details: "",
    calories: "",
    available: true,
  });

  useEffect(() => {
    loadMenuItems();
  }, [selectedCategory]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const cat =
        selectedCategory !== "All"
          ? `&category=${encodeURIComponent(selectedCategory)}`
          : "";
      const res = await fetch(`${API_BASE}/api/menu-items?${cat}`);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error) {
      showError("Failed to load menu items");
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = formData.pic;

      // Upload image if selected
      if (imageFile) {
        setUploading(true);
        const token = getToken();
        const imgFormData = new FormData();
        imgFormData.append("image", imageFile);
        imgFormData.append("name", imageFile.name.split(".")[0]);

        const imgRes = await fetch(`${API_BASE}/api/upload/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imgFormData,
        });

        const imgData = await imgRes.json();
        if (!imgRes.ok) throw new Error(imgData?.message || "Upload failed");
        imageUrl = imgData.url;
        setUploading(false);
      }

      const token = getToken();
      const payload = { ...formData, pic: imageUrl };

      const url = editingItem
        ? `${API_BASE}/api/menu-items/${editingItem._id}`
        : `${API_BASE}/api/menu-items`;

      const res = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save menu item");

      showSuccess(editingItem ? "Menu item updated!" : "Menu item created!");
      setShowModal(false);
      resetForm();
      loadMenuItems();
    } catch (error) {
      showError(error.message || "Failed to save menu item");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/menu-items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      showSuccess("Menu item deleted!");
      loadMenuItems();
    } catch (error) {
      showError("Failed to delete menu item");
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      pic: item.pic || "",
      name: item.name || "",
      category: item.category || "",
      price: item.price || "",
      details: item.details || "",
      calories: item.calories || "",
      available: item.available !== false,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setImageFile(null);
    setFormData({
      pic: "",
      name: "",
      category: "",
      price: "",
      details: "",
      calories: "",
      available: true,
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Appetizers: "🥟",
      "Main Course": "🍽️",
      Desserts: "🍰",
      Beverages: "🥤",
      Salads: "🥗",
      Soups: "🍲",
      Sides: "🍟",
      Specials: "⭐",
    };
    return icons[category] || "🍴";
  };

  return (
    <AdminLayout
      title="Menu Management"
      subtitle="Manage your restaurant menu items"
      icon="🍔"
    >
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-3xl font-black">{menuItems.length}</div>
          <div className="text-sm font-semibold opacity-90">Total Items</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-black">
            {menuItems.filter((i) => i.available).length}
          </div>
          <div className="text-sm font-semibold opacity-90">Available</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">📂</div>
          <div className="text-3xl font-black">{CATEGORIES.length - 1}</div>
          <div className="text-sm font-semibold opacity-90">Categories</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-3xl font-black">
            {menuItems.length > 0
              ? Math.round(
                  menuItems.reduce(
                    (sum, i) => sum + (parseFloat(i.price) || 0),
                    0,
                  ) / menuItems.length,
                )
              : 0}
            ৳
          </div>
          <div className="text-sm font-semibold opacity-90">Avg Price</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-lg"
            />
            <svg
              className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat !== "All" && getCategoryIcon(cat)} {cat}
              </button>
            ))}
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 whitespace-nowrap"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
            </div>
            <p className="text-slate-600 text-xl font-bold">
              Loading menu items...
            </p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-20 text-center">
          <div className="text-8xl mb-6">🍽️</div>
          <h3 className="text-3xl font-black text-slate-800 mb-4">
            No Menu Items Found
          </h3>
          <p className="text-slate-600 text-lg mb-8">
            {searchTerm
              ? "Try a different search term"
              : "Start by adding your first menu item"}
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
                {item.pic ? (
                  <img
                    src={item.pic}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {getCategoryIcon(item.category)}
                  </div>
                )}
                {/* Availability Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-bold ${
                      item.available
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-800 mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-600 font-semibold">
                      {getCategoryIcon(item.category)} {item.category}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {item.details || "No description available"}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-black text-orange-600">
                    {item.price} ৳
                  </div>
                  {item.calories && (
                    <div className="text-sm text-slate-600 font-semibold">
                      🔥 {item.calories} cal
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black">
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Item Image
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-orange-500 transition-all">
                  {formData.pic || imageFile ? (
                    <div className="relative">
                      <img
                        src={
                          imageFile
                            ? URL.createObjectURL(imageFile)
                            : formData.pic
                        }
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl mb-4"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setFormData({ ...formData, pic: "" });
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-6xl mb-4">📸</div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl cursor-pointer hover:shadow-lg hover:scale-105 transition-all inline-block"
                      >
                        Choose Image
                      </label>
                      <p className="text-sm text-slate-500 mt-2">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                  placeholder="e.g., Chicken Burger"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryIcon(cat)} {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Price (৳) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all resize-none"
                  placeholder="Describe your menu item..."
                />
              </div>

              {/* Calories & Available */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Calories
                  </label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={(e) =>
                      setFormData({ ...formData, calories: e.target.value })
                    }
                    min="0"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                    placeholder="e.g., 450"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          available: e.target.checked,
                        })
                      }
                      className="w-6 h-6 rounded-lg border-2 border-slate-300 text-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                    <span className="text-sm font-bold text-slate-700">
                      Available for Order
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-4 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading
                    ? "Uploading..."
                    : editingItem
                      ? "Update Item"
                      : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
