import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import AdminFooter from "../components/AdminFooter";
import { getToken } from "../utils/authStorage";

export default function ManageOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrderAmount: "",
    maxDiscountAmount: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
    showAsModal: true,
    imageUrl: "",
    backgroundColor: "#f97316",
    textColor: "#ffffff",
    buttonText: "Claim Offer",
    usageLimit: "",
    applicableCategories: [],
  });

  const discountTypes = [
    { value: "percentage", label: "Percentage Off" },
    { value: "fixed", label: "Fixed Amount Off" },
    { value: "bogo", label: "Buy One Get One" },
    { value: "free_delivery", label: "Free Delivery" },
  ];

  const categories = [
    "Pizza",
    "Burger",
    "Pasta",
    "Salad",
    "Dessert",
    "Drink",
    "Sandwich",
  ];

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch("/api/offers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(category)
        ? prev.applicableCategories.filter((c) => c !== category)
        : [...prev.applicableCategories, category],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const url = editingOffer
        ? `/api/offers/${editingOffer._id}`
        : "/api/offers";
      const method = editingOffer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchOffers();
        resetForm();
        setShowCreateModal(false);
        setEditingOffer(null);
      }
    } catch (error) {
      console.error("Error saving offer:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minimumOrderAmount: "",
      maxDiscountAmount: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
      showAsModal: true,
      imageUrl: "",
      backgroundColor: "#f97316",
      textColor: "#ffffff",
      buttonText: "Claim Offer",
      usageLimit: "",
      applicableCategories: [],
    });
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue || "",
      minimumOrderAmount: offer.minimumOrderAmount || "",
      maxDiscountAmount: offer.maxDiscountAmount || "",
      validFrom: new Date(offer.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(offer.validUntil).toISOString().slice(0, 16),
      isActive: offer.isActive,
      showAsModal: offer.showAsModal,
      imageUrl: offer.imageUrl || "",
      backgroundColor: offer.backgroundColor || "#f97316",
      textColor: offer.textColor || "#ffffff",
      buttonText: offer.buttonText || "Claim Offer",
      usageLimit: offer.usageLimit || "",
      applicableCategories: offer.applicableCategories || [],
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        const token = getToken();
        const response = await fetch(`/api/offers/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await fetchOffers();
        }
      } catch (error) {
        console.error("Error deleting offer:", error);
      }
    }
  };

  const toggleOfferStatus = async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/offers/${id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchOffers();
      }
    } catch (error) {
      console.error("Error toggling offer status:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDiscountDisplay = (offer) => {
    switch (offer.discountType) {
      case "percentage":
        return `${offer.discountValue}% OFF`;
      case "fixed":
        return `$${offer.discountValue} OFF`;
      case "bogo":
        return "BUY 1 GET 1";
      case "free_delivery":
        return "FREE DELIVERY";
      default:
        return "SPECIAL OFFER";
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <AdminNavbar />

      <div className="md:ml-16 px-6 py-8 pt-24 md:pt-8 transition-all duration-300">
        <div className="container mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-black text-orange-600 mb-2">
                  🎯 Manage Offers
                </h1>
                <p className="text-gray-600 text-lg">
                  Create and manage promotional offers for customers
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setEditingOffer(null);
                  setShowCreateModal(true);
                }}
                className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 hover:scale-105 transition-all"
              >
                ➕ Create New Offer
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="text-3xl font-black">{offers.length}</div>
              <div className="text-orange-100">Total Offers</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="text-3xl font-black">
                {offers.filter((o) => o.isActive).length}
              </div>
              <div className="text-green-100">Active Offers</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="text-3xl font-black">
                {offers.filter((o) => o.showAsModal).length}
              </div>
              <div className="text-blue-100">Modal Offers</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="text-3xl font-black">
                {
                  offers.filter((o) => new Date(o.validUntil) > new Date())
                    .length
                }
              </div>
              <div className="text-purple-100">Valid Offers</div>
            </div>
          </div>

          {/* Offers List */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              All Offers
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading offers...</p>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No offers yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first promotional offer to attract customers
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all"
                >
                  Create First Offer
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <div
                    key={offer._id}
                    className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all"
                    style={{
                      backgroundColor: offer.backgroundColor + "10",
                      borderColor: offer.backgroundColor + "30",
                    }}
                  >
                    {/* Offer Preview */}
                    <div
                      className="rounded-xl p-4 mb-4 text-center"
                      style={{
                        backgroundColor: offer.backgroundColor,
                        color: offer.textColor,
                      }}
                    >
                      <div className="text-2xl font-black mb-2">
                        {getDiscountDisplay(offer)}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
                      <p className="text-sm opacity-90">{offer.description}</p>
                    </div>

                    {/* Offer Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valid From:</span>
                        <span className="font-semibold">
                          {formatDate(offer.validFrom)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valid Until:</span>
                        <span className="font-semibold">
                          {formatDate(offer.validUntil)}
                        </span>
                      </div>
                      {offer.minimumOrderAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min Order:</span>
                          <span className="font-semibold">
                            ${offer.minimumOrderAmount}
                          </span>
                        </div>
                      )}
                      {offer.usageLimit && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Usage:</span>
                          <span className="font-semibold">
                            {offer.usageCount}/{offer.usageLimit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          offer.isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {offer.isActive ? "Active" : "Inactive"}
                      </span>
                      {offer.showAsModal && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600">
                          Modal
                        </span>
                      )}
                      {new Date(offer.validUntil) < new Date() && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                          Expired
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleOfferStatus(offer._id)}
                        className={`flex-1 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                          offer.isActive
                            ? "bg-yellow-500 text-white hover:bg-yellow-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {offer.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-orange-600">
                  {editingOffer ? "Edit Offer" : "Create New Offer"}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingOffer(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Offer Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      placeholder="e.g., Summer Special"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    >
                      {discountTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    placeholder="Describe your offer..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(formData.discountType === "percentage" ||
                    formData.discountType === "fixed") && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        placeholder={
                          formData.discountType === "percentage"
                            ? "e.g., 20"
                            : "e.g., 5.00"
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Minimum Order Amount
                    </label>
                    <input
                      type="number"
                      name="minimumOrderAmount"
                      value={formData.minimumOrderAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  {formData.discountType === "percentage" && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Max Discount Amount
                      </label>
                      <input
                        type="number"
                        name="maxDiscountAmount"
                        value={formData.maxDiscountAmount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        placeholder="Optional"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Valid From *
                    </label>
                    <input
                      type="datetime-local"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Valid Until *
                    </label>
                    <input
                      type="datetime-local"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingOffer(null);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
                  >
                    {editingOffer ? "Update Offer" : "Create Offer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <AdminFooter />
    </div>
  );
}
