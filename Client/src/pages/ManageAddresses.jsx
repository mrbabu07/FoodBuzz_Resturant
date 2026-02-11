import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";
import { apiFetch } from "../utils/api";

export default function ManageAddresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: "home",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    area: "",
    city: "",
    postalCode: "",
    landmark: "",
    deliveryInstructions: "",
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/addresses");
      setAddresses(data.addresses || []);
    } catch (error) {
      showError("Failed to load addresses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        await apiFetch(`/api/addresses/${editingAddress._id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        showSuccess("Address updated successfully");
      } else {
        await apiFetch("/api/addresses", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        showSuccess("Address added successfully");
      }

      setShowModal(false);
      setEditingAddress(null);
      resetForm();
      loadAddresses();
    } catch (error) {
      showError(error.message || "Failed to save address");
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      area: address.area,
      city: address.city,
      postalCode: address.postalCode || "",
      landmark: address.landmark || "",
      deliveryInstructions: address.deliveryInstructions || "",
      isDefault: address.isDefault,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      await apiFetch(`/api/addresses/${id}`, { method: "DELETE" });
      showSuccess("Address deleted");
      loadAddresses();
    } catch (error) {
      showError("Failed to delete address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await apiFetch(`/api/addresses/${id}/default`, { method: "PATCH" });
      showSuccess("Default address updated");
      loadAddresses();
    } catch (error) {
      showError("Failed to set default address");
    }
  };

  const resetForm = () => {
    setFormData({
      label: "home",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      area: "",
      city: "",
      postalCode: "",
      landmark: "",
      deliveryInstructions: "",
      isDefault: false,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-500 text-white py-12 px-8 rounded-3xl shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl">
                  📍
                </div>
                <div>
                  <h1 className="text-4xl font-black">Manage Addresses</h1>
                  <p className="text-purple-100 text-lg">
                    Save addresses for faster checkout
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingAddress(null);
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-white text-purple-600 hover:bg-purple-50 rounded-2xl font-bold transition-all"
            >
              + Add Address
            </button>
          </div>
        </div>

        {/* Addresses Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 p-12 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              No addresses saved
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first delivery address
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:shadow-lg hover:scale-105 transition-all"
            >
              + Add Address
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`bg-white rounded-2xl shadow-lg border-2 p-6 hover:shadow-xl transition-all ${
                  address.isDefault
                    ? "border-purple-500 ring-4 ring-purple-100"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        address.label === "home"
                          ? "bg-blue-100"
                          : address.label === "work"
                            ? "bg-orange-100"
                            : "bg-purple-100"
                      }`}
                    >
                      {address.label === "home"
                        ? "🏠"
                        : address.label === "work"
                          ? "💼"
                          : "📍"}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 capitalize">
                        {address.label}
                      </h3>
                      {address.isDefault && (
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-bold text-gray-900">{address.fullName}</p>
                  <p>{address.phone}</p>
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.area}, {address.city}
                  </p>
                  {address.postalCode && (
                    <p>Postal Code: {address.postalCode}</p>
                  )}
                  {address.landmark && (
                    <p className="text-gray-600">
                      Landmark: {address.landmark}
                    </p>
                  )}
                  {address.deliveryInstructions && (
                    <p className="text-gray-600 italic">
                      Note: {address.deliveryInstructions}
                    </p>
                  )}
                </div>

                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="w-full mt-4 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-bold transition-all"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl">
              <h2 className="text-2xl font-black">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Address Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["home", "work", "other"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, label: type }))
                      }
                      className={`px-4 py-3 rounded-xl font-bold capitalize transition-all ${
                        formData.label === type
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type === "home" ? "🏠" : type === "work" ? "💼" : "📍"}{" "}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address Lines */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="House/Flat number, Street name"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Building, Apartment (optional)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Area, City, Postal Code */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Area *
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Nearby landmark for easy location"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Delivery Instructions
                </label>
                <textarea
                  name="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={handleChange}
                  placeholder="Any special instructions for delivery"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Set as Default */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label className="text-sm font-bold text-gray-700">
                  Set as default address
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  {editingAddress ? "Update Address" : "Add Address"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAddress(null);
                    resetForm();
                  }}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
