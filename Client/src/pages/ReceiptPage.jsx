import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { getReceiptTemplate } from "../context/receiptTemplate";

export default function ReceiptPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    fetchReceipt(orderId);
  }, [searchParams]);

  const fetchReceipt = async (orderId) => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch(`/api/orders/${orderId}/receipt`);
      setReceipt(data);
    } catch (err) {
      setError(err.message || "Failed to load receipt");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!receipt) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const cartItems = (receipt.items || []).map((it) => ({
      name: it.name,
      quantity: it.qty,
      price: it.price,
    }));

    const htmlString = getReceiptTemplate({
      cartItems,
      subTotal: receipt.subtotal,
      shipping: receipt.deliveryFee,
      discount: 0,
      tax: 0,
      total: receipt.total,
      billing: {
        fullname: receipt.customerName || "Customer",
        email: receipt.userEmail || "",
        phone: receipt.phone,
        address: receipt.address,
        country: "Bangladesh",
      },
      receiptId: receipt.id,
      formattedDate,
    });

    const newWindow = window.open("", "_blank", "width=800,height=600");
    newWindow.document.write(htmlString);
    newWindow.document.close();
    newWindow.focus();

    setTimeout(() => {
      newWindow.print();
      newWindow.close();
    }, 500);
  };

  const handleOrderAgain = () => {
    navigate("/order_1st");
  };

  const handleBrowseRecipes = () => {
    navigate("/recipe");
  };

  if (loading) {
    return (
      <div className="bg-white w-full relative min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-900 text-xl font-black">
              Loading your receipt...
            </div>
            <p className="text-gray-600 mt-2">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white w-full relative min-h-screen">
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="text-center bg-white p-8 rounded-3xl shadow-2xl border-2 border-orange-100 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-black text-red-600 mb-2">
              Error Loading Receipt
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/order_tracking")}
              className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-black hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition-all"
            >
              📦 Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="bg-white w-full relative min-h-screen">
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="text-center bg-white p-8 rounded-3xl shadow-2xl border-2 border-orange-100 max-w-md">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              No Receipt Found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find a receipt for this order
            </p>
            <button
              onClick={() => navigate("/order_tracking")}
              className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-black hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition-all"
            >
              📦 Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full relative min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <i className="fas fa-check text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Order Successful! 🎉
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Thank you for your order. Here's your receipt.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8 mb-8">
          {/* Receipt Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-100">
            <h2 className="text-3xl font-black text-orange-600 mb-2">
              FoodBuzz Receipt
            </h2>
            <p className="text-gray-600 font-medium">
              Order ID:{" "}
              <span className="font-black text-gray-900">{receipt.id}</span>
            </p>
            <p className="text-gray-600 font-medium">
              Date:{" "}
              <span className="font-black text-gray-900">
                {new Date(receipt.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>

          {/* Customer Information */}
          <div className="mb-8 p-6 bg-orange-50 rounded-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 font-medium">
                  <span className="font-black text-gray-900">Name:</span>{" "}
                  {receipt.customerName || "Customer"}
                </p>
                <p className="text-gray-600 font-medium">
                  <span className="font-black text-gray-900">Phone:</span>{" "}
                  {receipt.phone}
                </p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">
                  <span className="font-black text-gray-900">Status:</span>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-sm font-black ${
                      receipt.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : receipt.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {receipt.status}
                  </span>
                </p>
                <p className="text-gray-600 font-medium">
                  <span className="font-black text-gray-900">Address:</span>{" "}
                  {receipt.address}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="text-xl font-black text-gray-900 mb-4">
              Order Items
            </h3>
            <div className="space-y-4">
              {(receipt.items || []).map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl"
                >
                  <div className="flex-1">
                    <h4 className="font-black text-gray-900">{item.name}</h4>
                    <p className="text-gray-600 font-medium">
                      {item.qty} × TK {Number(item.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-lg font-black text-orange-600">
                    TK{" "}
                    {(Number(item.price || 0) * Number(item.qty || 1)).toFixed(
                      2,
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t-2 border-gray-100 pt-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-black">Sub-total</span>
                <span className="font-black">
                  TK {Number(receipt.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-black">Delivery Fee</span>
                <span className="font-black text-green-600">Free 🎉</span>
              </div>

              <div className="border-t-2 border-gray-100 pt-3">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-orange-500 text-white">
                  <span className="text-xl font-black">Total Amount</span>
                  <span className="text-3xl font-black">
                    TK {Number(receipt.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="p-6 rounded-2xl bg-green-50 border-2 border-green-200 text-center">
              <p className="text-green-900 font-black flex items-center justify-center gap-2">
                <span className="text-2xl">✅</span>
                <span>Payment Successful - Order Confirmed!</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handlePrint}
            className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-black hover:bg-blue-600 hover:shadow-xl hover:scale-105 transition-all"
          >
            🖨️ Print Receipt
          </button>
          <button
            onClick={handleOrderAgain}
            className="px-8 py-4 rounded-2xl bg-orange-500 text-white font-black hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition-all"
          >
            🛒 Order Again
          </button>
          <button
            onClick={handleBrowseRecipes}
            className="px-8 py-4 rounded-2xl bg-green-500 text-white font-black hover:bg-green-600 hover:shadow-xl hover:scale-105 transition-all"
          >
            📖 Browse Recipes
          </button>
          <button
            onClick={() => navigate("/order_tracking")}
            className="px-8 py-4 rounded-2xl bg-gray-500 text-white font-black hover:bg-gray-600 hover:shadow-xl hover:scale-105 transition-all"
          >
            📦 Track Orders
          </button>
        </div>

        {/* Additional Notes */}
        {receipt.notes && (
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
            <h3 className="text-lg font-black text-gray-900 mb-2">
              Order Notes
            </h3>
            <p className="text-gray-700 font-medium">{receipt.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
