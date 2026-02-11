import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  showSuccess,
  showError,
  showLoading,
  dismissToast,
} from "../utils/toast";

export default function POSDashboard() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [orderItems, setOrderItems] = useState([]);
  const [orderType, setOrderType] = useState("dine-in"); // dine-in or takeaway
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discountType, setDiscountType] = useState("none"); // none, percentage, fixed
  const [discountValue, setDiscountValue] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [categories, setCategories] = useState([]);
  const receiptRef = useRef(null);

  // Check if user is admin or staff
  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("roms_current_user") || "null",
    );
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      showError("Access denied. Admin or Staff only.");
      navigate("/");
      return;
    }
    loadMenuItems();
  }, [navigate]);

  const loadMenuItems = async () => {
    try {
      const response = await fetch("/api/menu-items");
      if (!response.ok) throw new Error("Failed to load menu items");
      const data = await response.json();
      setMenuItems(data);
      setFilteredItems(data);

      // Extract unique categories
      const uniqueCategories = [
        "All",
        ...new Set(data.map((item) => item.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      showError("Failed to load menu items");
      console.error(error);
    }
  };

  // Search and filter
  useEffect(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.category && item.category.toLowerCase().includes(query)),
      );
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedCategory, menuItems]);

  // Add item to order
  const addToOrder = (item) => {
    const existingIndex = orderItems.findIndex((oi) => oi._id === item._id);

    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1, notes: "" }]);
    }

    showSuccess(`Added ${item.name}`);
  };

  // Update quantity
  const updateQuantity = (index, newQty) => {
    if (newQty <= 0) {
      removeItem(index);
      return;
    }
    const updated = [...orderItems];
    updated[index].quantity = newQty;
    setOrderItems(updated);
  };

  // Remove item
  const removeItem = (index) => {
    const updated = orderItems.filter((_, i) => i !== index);
    setOrderItems(updated);
  };

  // Update item notes
  const updateItemNotes = (index, notes) => {
    const updated = [...orderItems];
    updated[index].notes = notes;
    setOrderItems(updated);
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    let discount = 0;

    if (discountType === "percentage") {
      discount = (subtotal * discountValue) / 100;
    } else if (discountType === "fixed") {
      discount = discountValue;
    }

    const tax = (subtotal - discount) * 0.05; // 5% tax
    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  };

  // Apply discount
  const applyDiscount = (type, value) => {
    setDiscountType(type);
    setDiscountValue(value);
    setShowDiscountModal(false);
    showSuccess(
      `Discount applied: ${type === "percentage" ? value + "%" : "৳" + value}`,
    );
  };

  // Clear order
  const clearOrder = () => {
    if (orderItems.length === 0) return;
    if (window.confirm("Clear all items from current order?")) {
      setOrderItems([]);
      setOrderNotes("");
      setDiscountType("none");
      setDiscountValue(0);
      showSuccess("Order cleared");
    }
  };

  // Place order
  const placeOrder = async () => {
    if (orderItems.length === 0) {
      showError("Please add items to the order");
      return;
    }

    const loadingToast = showLoading("Processing order...");
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("roms_token");
      if (!token) {
        dismissToast(loadingToast);
        showError("Please login to continue");
        navigate("/login");
        return;
      }

      const { subtotal, discount, tax, total } = calculateTotals();

      const orderData = {
        items: orderItems.map((item) => ({
          menuItemId: item._id,
          qty: item.quantity,
          notes: item.notes || "",
        })),
        orderType: orderType,
        notes: orderNotes,
        paymentMethod: paymentMethod,
        discount: discount,
        tax: tax,
        total: total,
        status: "pending",
      };

      const response = await fetch("/api/orders/pos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      dismissToast(loadingToast);
      showSuccess("Order placed successfully!");

      // Print receipt
      printReceipt(data.order);

      // Clear order
      setOrderItems([]);
      setOrderNotes("");
      setDiscountType("none");
      setDiscountValue(0);
    } catch (error) {
      dismissToast(loadingToast);
      showError(error.message || "Failed to place order");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Print receipt
  const printReceipt = (order) => {
    const printWindow = window.open("", "_blank");
    const { subtotal, discount, tax, total } = calculateTotals();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order._id}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
          h1 { text-align: center; font-size: 24px; margin-bottom: 10px; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .info { margin: 10px 0; }
          .items { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .item-notes { font-size: 12px; color: #666; margin-left: 20px; }
          .totals { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
          .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .total-row.grand { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; border-top: 2px dashed #000; padding-top: 10px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍽️ FoodBuzz</h1>
          <p>Restaurant Management System</p>
          <p>Order #${order._id || "N/A"}</p>
        </div>
        
        <div class="info">
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Type:</strong> ${orderType.toUpperCase()}</p>
          <p><strong>Payment:</strong> ${paymentMethod.toUpperCase()}</p>
          ${orderNotes ? `<p><strong>Notes:</strong> ${orderNotes}</p>` : ""}
        </div>
        
        <div class="items">
          <h3>Items:</h3>
          ${orderItems
            .map(
              (item) => `
            <div class="item">
              <span>${item.quantity}x ${item.name}</span>
              <span>৳${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            ${item.notes ? `<div class="item-notes">Note: ${item.notes}</div>` : ""}
          `,
            )
            .join("")}
        </div>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>৳${subtotal.toFixed(2)}</span>
          </div>
          ${
            discount > 0
              ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-৳${discount.toFixed(2)}</span>
            </div>
          `
              : ""
          }
          <div class="total-row">
            <span>Tax (5%):</span>
            <span>৳${tax.toFixed(2)}</span>
          </div>
          <div class="total-row grand">
            <span>TOTAL:</span>
            <span>৳${total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your order!</p>
          <p>Visit us again soon 😊</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const { subtotal, discount, tax, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 px-6 shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center text-2xl">
              💳
            </div>
            <div>
              <h1 className="text-2xl font-black">POS Dashboard</h1>
              <p className="text-orange-100 text-sm">
                Fast order processing system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-orange-100">Current Time</div>
              <div className="text-lg font-bold">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-xl font-bold transition-all"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Menu Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-white font-bold mb-2 text-sm">
                    🔍 Search Menu
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                    className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-white font-bold mb-2 text-sm">
                    🍽️ Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
              <h2 className="text-xl font-black text-white mb-4">
                Menu Items ({filteredItems.length})
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredItems.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => addToOrder(item)}
                    disabled={!item.isAvailable}
                    className="bg-slate-700 rounded-xl p-4 hover:bg-slate-600 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-slate-600 hover:border-orange-500 group"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-24 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f97316"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-size="24">🍽️</text></svg>`;
                      }}
                    />
                    <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 group-hover:text-orange-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-orange-400 font-black text-lg">
                      ৳{item.price}
                    </p>
                    {!item.isAvailable && (
                      <span className="text-xs text-red-400 font-bold">
                        Unavailable
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Current Order */}
          <div className="space-y-6">
            {/* Order Type */}
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
              <h2 className="text-xl font-black text-white mb-4">Order Type</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOrderType("dine-in")}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    orderType === "dine-in"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  🍽️ Dine-In
                </button>
                <button
                  onClick={() => setOrderType("takeaway")}
                  className={`px-4 py-3 rounded-xl font-bold transition-all ${
                    orderType === "takeaway"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  🥡 Takeaway
                </button>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white">
                  Current Order ({orderItems.length})
                </h2>
                {orderItems.length > 0 && (
                  <button
                    onClick={clearOrder}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-4">
                {orderItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <div className="text-6xl mb-3">🛒</div>
                    <p className="font-semibold">No items added yet</p>
                    <p className="text-sm">Click menu items to add</p>
                  </div>
                ) : (
                  orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-700 rounded-xl p-4 border-2 border-slate-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-sm mb-1">
                            {item.name}
                          </h3>
                          <p className="text-orange-400 font-bold">
                            ৳{item.price} × {item.quantity}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold"
                        >
                          −
                        </button>
                        <span className="text-white font-bold px-3">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(index, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold"
                        >
                          +
                        </button>
                        <span className="text-orange-400 font-bold ml-auto">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateItemNotes(index, e.target.value)}
                        placeholder="Add notes (e.g., no onion, extra spicy)"
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm placeholder-slate-400 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Order Notes */}
              {orderItems.length > 0 && (
                <div className="mb-4">
                  <label className="block text-white font-bold mb-2 text-sm">
                    📝 Order Notes
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Special instructions for the entire order..."
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none resize-none"
                  />
                </div>
              )}

              {/* Totals */}
              {orderItems.length > 0 && (
                <div className="space-y-2 border-t-2 border-slate-600 pt-4">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal:</span>
                    <span className="font-bold">৳{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount:</span>
                      <span className="font-bold">-৳{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>Tax (5%):</span>
                    <span className="font-bold">৳{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white text-xl font-black border-t-2 border-slate-600 pt-2">
                    <span>TOTAL:</span>
                    <span className="text-orange-400">৳{total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            {orderItems.length > 0 && (
              <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
                <h2 className="text-xl font-black text-white mb-4">
                  💳 Payment Method
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      paymentMethod === "cash"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      paymentMethod === "card"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    💳 Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod("stripe")}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      paymentMethod === "stripe"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    🔒 Stripe
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {orderItems.length > 0 && (
              <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 space-y-3">
                <button
                  onClick={() => setShowDiscountModal(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-black rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  🎉 Apply Discount
                </button>

                <button
                  onClick={() => setShowSplitBillModal(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-black rounded-xl transition-all hover:scale-105 shadow-lg"
                >
                  ✂️ Split Bill
                </button>

                <button
                  onClick={placeOrder}
                  disabled={isProcessing}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black rounded-xl transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isProcessing ? "Processing..." : "🖨️ Place Order & Print"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-white mb-6">
              Apply Discount
            </h2>

            <div className="space-y-4 mb-6">
              <button
                onClick={() => applyDiscount("percentage", 10)}
                className="w-full px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <span>10% Off</span>
                  <span className="text-orange-400">
                    -৳{(subtotal * 0.1).toFixed(2)}
                  </span>
                </div>
              </button>

              <button
                onClick={() => applyDiscount("percentage", 20)}
                className="w-full px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <span>20% Off</span>
                  <span className="text-orange-400">
                    -৳{(subtotal * 0.2).toFixed(2)}
                  </span>
                </div>
              </button>

              <button
                onClick={() => applyDiscount("fixed", 50)}
                className="w-full px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <span>৳50 Off</span>
                  <span className="text-orange-400">-৳50.00</span>
                </div>
              </button>

              <button
                onClick={() => applyDiscount("fixed", 100)}
                className="w-full px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <span>৳100 Off</span>
                  <span className="text-orange-400">-৳100.00</span>
                </div>
              </button>

              <button
                onClick={() => applyDiscount("none", 0)}
                className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
              >
                Remove Discount
              </button>
            </div>

            <button
              onClick={() => setShowDiscountModal(false)}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Split Bill Modal */}
      {showSplitBillModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-white mb-6">Split Bill</h2>

            <div className="mb-6">
              <label className="block text-white font-bold mb-3">
                Split into how many parts?
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSplitCount(num)}
                    className={`px-4 py-3 rounded-xl font-bold transition-all ${
                      splitCount === num
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-700 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-slate-300 mb-2">Each person pays:</p>
                <p className="text-4xl font-black text-orange-400">
                  ৳{(total / splitCount).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  showSuccess(
                    `Bill split into ${splitCount} parts: ৳${(total / splitCount).toFixed(2)} each`,
                  );
                  setShowSplitBillModal(false);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold transition-all"
              >
                Confirm Split
              </button>
              <button
                onClick={() => setShowSplitBillModal(false)}
                className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
