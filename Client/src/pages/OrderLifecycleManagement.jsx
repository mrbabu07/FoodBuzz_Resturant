import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  showSuccess,
  showError,
  showLoading,
  dismissToast,
} from "../utils/toast";

export default function OrderLifecycleManagement() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnData, setReturnData] = useState({
    reason: "",
    description: "",
  });
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("roms_current_user") || "null",
    );
    if (!user) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("roms_token");
      const response = await fetch("/api/orders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to load orders");
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      showError("Failed to load orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      showError("Please provide a cancellation reason");
      return;
    }

    const loadingToast = showLoading("Cancelling order...");
    try {
      const token = localStorage.getItem("roms_token");
      const response = await fetch(`/api/orders/${selectedOrder._id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to cancel order");

      dismissToast(loadingToast);
      showSuccess(
        data.refund
          ? "Order cancelled and refund initiated!"
          : "Order cancelled successfully!",
      );
      setShowCancelModal(false);
      setCancelReason("");
      loadOrders();
    } catch (error) {
      dismissToast(loadingToast);
      showError(error.message);
    }
  };

  const handleRequestReturn = async () => {
    if (!returnData.reason.trim()) {
      showError("Please select a return reason");
      return;
    }

    const loadingToast = showLoading("Submitting return request...");
    try {
      const token = localStorage.getItem("roms_token");
      const response = await fetch(`/api/orders/${selectedOrder._id}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(returnData),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to submit return request");

      dismissToast(loadingToast);
      showSuccess("Return request submitted successfully!");
      setShowReturnModal(false);
      setReturnData({ reason: "", description: "" });
      loadOrders();
    } catch (error) {
      dismissToast(loadingToast);
      showError(error.message);
    }
  };

  const loadTimeline = async (orderId) => {
    try {
      const token = localStorage.getItem("roms_token");
      const response = await fetch(`/api/orders/${orderId}/timeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to load timeline");
      const data = await response.json();
      setTimeline(data.timeline || []);
      setShowTimelineModal(true);
    } catch (error) {
      showError("Failed to load order timeline");
      console.error(error);
    }
  };

  const canCancelOrder = (order) => {
    const cancellableStatuses = ["Placed", "Scheduled", "Pending"];
    if (!cancellableStatuses.includes(order.status)) return false;

    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const minutesPassed = (now - orderTime) / 1000 / 60;
    return minutesPassed <= 5;
  };

  const canRequestReturn = (order) => {
    return order.status === "Delivered" || order.status === "Completed";
  };

  const getStatusColor = (status) => {
    const colors = {
      Placed: "bg-blue-100 text-blue-700",
      Scheduled: "bg-purple-100 text-purple-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Processing: "bg-orange-100 text-orange-700",
      Ready: "bg-green-100 text-green-700",
      "Out for Delivery": "bg-cyan-100 text-cyan-700",
      Delivered: "bg-green-100 text-green-700",
      Completed: "bg-gray-100 text-gray-700",
      Cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-8 px-8 rounded-3xl shadow-2xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2">📦 My Orders</h1>
              <p className="text-orange-100">
                Manage your orders, cancellations, and returns
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-xl font-bold transition-all"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Orders Yet
            </h3>
            <p className="text-slate-400 mb-6">
              Start ordering delicious food!
            </p>
            <button
              onClick={() => navigate("/order_1st")}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 p-6 hover:shadow-3xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Order #{order._id?.slice(-8)}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-slate-300"
                    >
                      <span>
                        {item.qty}x {item.name}
                      </span>
                      <span className="font-bold">
                        ৳{(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-slate-700 pt-4 mb-4">
                  <div className="flex items-center justify-between text-white text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-400">
                      ৳{order.total?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => loadTimeline(order._id)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all"
                  >
                    📊 View Timeline
                  </button>

                  {canCancelOrder(order) && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowCancelModal(true);
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
                    >
                      ❌ Cancel Order
                    </button>
                  )}

                  {canRequestReturn(order) && !order.returnRequest && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowReturnModal(true);
                      }}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-all"
                    >
                      🔄 Request Return
                    </button>
                  )}

                  {order.returnRequest && (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-bold">
                      Return: {order.returnRequest.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-white mb-4">
              Cancel Order
            </h2>
            <p className="text-slate-300 mb-6">
              Order #{selectedOrder?._id?.slice(-8)} - ৳
              {selectedOrder?.total?.toFixed(2)}
            </p>

            <label className="block text-white font-bold mb-2">
              Cancellation Reason
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please tell us why you're cancelling..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none resize-none mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={handleCancelOrder}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
              >
                Confirm Cancel
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-700 p-8 max-w-md w-full">
            <h2 className="text-2xl font-black text-white mb-4">
              Request Return
            </h2>
            <p className="text-slate-300 mb-6">
              Order #{selectedOrder?._id?.slice(-8)}
            </p>

            <label className="block text-white font-bold mb-2">
              Return Reason
            </label>
            <select
              value={returnData.reason}
              onChange={(e) =>
                setReturnData({ ...returnData, reason: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:border-orange-500 focus:outline-none mb-4"
            >
              <option value="">Select reason...</option>
              <option value="wrong_item">Wrong item delivered</option>
              <option value="damaged">Item damaged/spoiled</option>
              <option value="quality">Poor quality</option>
              <option value="missing_items">Missing items</option>
              <option value="other">Other</option>
            </select>

            <label className="block text-white font-bold mb-2">
              Description
            </label>
            <textarea
              value={returnData.description}
              onChange={(e) =>
                setReturnData({ ...returnData, description: e.target.value })
              }
              placeholder="Please provide more details..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none resize-none mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={handleRequestReturn}
                className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-all"
              >
                Submit Request
              </button>
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnData({ reason: "", description: "" });
                }}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl shadow-2xl border-2 border-slate-700 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-white mb-6">
              Order Timeline
            </h2>

            <div className="space-y-4">
              {timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="text-4xl">{event.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold text-white">
                        {event.status}
                      </h3>
                      <span className="text-sm text-slate-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTimelineModal(false)}
              className="w-full mt-6 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
