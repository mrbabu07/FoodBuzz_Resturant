import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCartItems } = useCart();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("No session ID found");
      setProcessing(false);
      return;
    }

    // Verify payment and save to database
    verifyPayment(sessionId);
  }, [searchParams, setCartItems]);

  const verifyPayment = async (sessionId) => {
    try {
      const token = localStorage.getItem("roms_token");
      if (!token) {
        setError("Please login to continue");
        setProcessing(false);
        return;
      }

      // Call backend to verify payment and save details
      const response = await fetch(
        `/api/payments/verify?sessionId=${sessionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      console.log("Payment verified:", data);

      // Clear cart
      setCartItems([]);

      // Store order ID if available
      if (data.order?.id) {
        setOrderId(data.order.id);
      }

      setProcessing(false);
    } catch (err) {
      console.error("Payment verification error:", err);
      setError(err.message || "Failed to verify payment");
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Verifying your payment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/order_1st")}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-2">Thank you for your order.</p>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully.
        </p>

        {orderId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Order ID:</strong> {orderId}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/order_tracking")}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/order_1st")}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Order Again
          </button>
        </div>
      </div>
    </div>
  );
}
