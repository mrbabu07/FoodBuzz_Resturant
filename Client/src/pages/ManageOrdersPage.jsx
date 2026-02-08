import React, { useState, useEffect } from "react";
import AdminFooter from "../components/AdminFooter";
import AdminNavbar from "../components/AdminNavbar";
import { apiFetch } from "../utils/api";

const statusFilters = [
  "All",
  "Placed",
  "Processing",
  "Ready",
  "Delivered",
  "Cancelled",
];

const statusColors = {
  Placed: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Ready: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showDetailsId, setShowDetailsId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/api/orders/all");
      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (id) => {
    setShowDetailsId(showDetailsId === id ? null : id);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      // Update local state
      const updatedOrders = orders.map((order) => {
        if (order._id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      setOrders(updatedOrders);

      // Show success message
      alert(`Order status updated to ${newStatus} successfully!`);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusButtons = (order) => {
    const buttons = [];

    if (order.status === "Placed") {
      buttons.push(
        <button
          key="process"
          onClick={() => handleStatusChange(order._id, "Processing")}
          disabled={updatingStatus === order._id}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-all"
        >
          {updatingStatus === order._id ? "⏳" : "🔄"} Process
        </button>,
      );
    }

    if (order.status === "Processing") {
      buttons.push(
        <button
          key="ready"
          onClick={() => handleStatusChange(order._id, "Ready")}
          disabled={updatingStatus === order._id}
          className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 disabled:opacity-50 transition-all"
        >
          {updatingStatus === order._id ? "⏳" : "✨"} Ready
        </button>,
      );
    }

    if (order.status === "Ready") {
      buttons.push(
        <button
          key="deliver"
          onClick={() => handleStatusChange(order._id, "Delivered")}
          disabled={updatingStatus === order._id}
          className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 disabled:opacity-50 transition-all"
        >
          {updatingStatus === order._id ? "⏳" : "✅"} Deliver
        </button>,
      );
    }

    // Cancel button (available for non-delivered/non-cancelled orders)
    if (order.status !== "Delivered" && order.status !== "Cancelled") {
      buttons.push(
        <button
          key="cancel"
          onClick={() => {
            if (window.confirm("Are you sure you want to cancel this order?")) {
              handleStatusChange(order._id, "Cancelled");
            }
          }}
          disabled={updatingStatus === order._id}
          className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-all"
        >
          {updatingStatus === order._id ? "⏳" : "❌"} Cancel
        </button>,
      );
    }

    return buttons;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.deliveryAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <AdminNavbar />
        <div className="md:ml-16 px-6 py-8 pt-24 md:pt-8 transition-all duration-300">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">
                Loading orders...
              </p>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <AdminNavbar />
        <div className="md:ml-16 px-6 py-8 pt-24 md:pt-8 transition-all duration-300">
          <div className="flex items-center justify-center h-64">
            <div className="text-center bg-white p-8 rounded-3xl shadow-2xl border-2 border-red-100 max-w-md">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-xl font-black mb-6">
                Error: {error}
              </p>
              <button
                onClick={fetchOrders}
                className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-black hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

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
                  🛒 Manage Orders
                </h1>
                <p className="text-gray-600 text-lg">
                  Track and manage customer orders
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold">
                  {filteredOrders.length} Orders
                </div>
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 hover:scale-105 transition-all"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {statusFilters.slice(1).map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              return (
                <div
                  key={status}
                  className={`rounded-2xl p-4 ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
                >
                  <div className="text-2xl font-black">{count}</div>
                  <div className="text-sm font-semibold">{status}</div>
                </div>
              );
            })}
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔍 Search Orders
                </label>
                <input
                  type="text"
                  placeholder="Search by address, phone, order ID, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📊 Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
                >
                  {statusFilters.map((status) => (
                    <option key={status} value={status}>
                      {status === "All" ? "🍽️ All Orders" : `📋 ${status}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        Order Info
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
                        Actions
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <React.Fragment key={order._id}>
                        <tr className="hover:bg-orange-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-bold text-gray-900">
                                #{order._id?.slice(-6).toUpperCase()}
                              </div>
                              <div className="text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </div>
                              <div className="text-gray-500">
                                {order.paymentMethod} • {order.paymentStatus}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-semibold text-gray-900">
                                {order.notes?.split(",")[0] || "Customer"}
                              </div>
                              <div className="text-gray-500">{order.phone}</div>
                              <div className="text-gray-500 truncate max-w-xs">
                                📍 {order.deliveryAddress}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-bold text-gray-900">
                                ৳{order.total}
                              </div>
                              <div className="text-gray-500">
                                {order.items?.length || 0} items
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2 justify-center">
                              {getStatusButtons(order)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleDetails(order._id)}
                              className="text-orange-600 hover:text-orange-800 font-semibold hover:underline transition-colors"
                            >
                              {showDetailsId === order._id ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>

                        {showDetailsId === order._id && (
                          <tr className="bg-orange-50">
                            <td colSpan={6} className="px-6 py-6">
                              <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <h4 className="text-lg font-bold text-gray-900 mb-4">
                                  Order Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-2">
                                      📋 Order Information
                                    </h5>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <span className="font-medium">
                                          Order ID:
                                        </span>{" "}
                                        {order._id}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Status:
                                        </span>{" "}
                                        {order.status}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Payment Method:
                                        </span>{" "}
                                        {order.paymentMethod}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Payment Status:
                                        </span>
                                        <span
                                          className={`ml-1 font-semibold ${
                                            order.paymentStatus === "completed"
                                              ? "text-green-600"
                                              : "text-yellow-600"
                                          }`}
                                        >
                                          {order.paymentStatus}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-2">
                                      👤 Customer Information
                                    </h5>
                                    <div className="space-y-2 text-sm">
                                      <p>
                                        <span className="font-medium">
                                          Phone:
                                        </span>{" "}
                                        {order.phone}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Address:
                                        </span>{" "}
                                        {order.deliveryAddress}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Notes:
                                        </span>{" "}
                                        {order.notes || "No notes"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-6">
                                  <h5 className="font-semibold text-gray-900 mb-3">
                                    🛒 Order Items
                                  </h5>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full bg-gray-50 rounded-lg">
                                      <thead>
                                        <tr className="border-b">
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                                            Item
                                          </th>
                                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                                            Qty
                                          </th>
                                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                                            Price
                                          </th>
                                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                                            Total
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.items?.map((item, idx) => (
                                          <tr
                                            key={idx}
                                            className="border-b border-gray-200"
                                          >
                                            <td className="px-4 py-2 text-sm">
                                              {item.name}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-center">
                                              {item.qty}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right">
                                              ৳{item.price}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right font-semibold">
                                              ৳{item.price * item.qty}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                  <div className="flex justify-between items-center text-sm mb-2">
                                    <span>Subtotal:</span>
                                    <span>৳{order.subtotal}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm mb-2">
                                    <span>Delivery Fee:</span>
                                    <span>৳{order.deliveryFee}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-lg font-bold text-orange-600 border-t pt-2">
                                    <span>Total:</span>
                                    <span>৳{order.total}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminFooter />
    </div>
  );
}
