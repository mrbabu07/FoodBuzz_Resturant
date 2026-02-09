import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  showError,
  showOrderPlaced,
  showWarning,
  showLoading,
  dismissToast,
} from "../utils/toast";
import {
  sendNotification,
  NotificationTemplates,
} from "../utils/pushNotifications";

export default function PlaceOrderPage() {
  const navigate = useNavigate();
  const { cartItems, setCartItems } = useCart();

  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const [billing, setBilling] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    country: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isProcessing, setIsProcessing] = useState(false);

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      setBilling((prev) => ({ ...prev, [id]: onlyNums }));
    } else {
      setBilling((prev) => ({ ...prev, [id]: value }));
    }
  };

  const summaryRef = useRef(null);
  const billingRef = useRef(null);

  useEffect(() => {
    if (summaryRef.current && billingRef.current) {
      const maxHeight = Math.max(
        summaryRef.current.clientHeight,
        billingRef.current.clientHeight,
      );
      summaryRef.current.style.height = maxHeight + "px";
      billingRef.current.style.height = maxHeight + "px";
    }
  }, [cartItems]);

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = 0;
  const discount = 0;
  const tax = 7.11;
  const total = subTotal + shipping - discount + tax;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      showWarning("You must add at least 1 item to place an order.");
      return;
    }

    const { fullname, email, phone, address, country } = billing;
    if (
      !fullname.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !country.trim()
    ) {
      showWarning(
        "Please fill up all billing information fields before placing order.",
      );
      return;
    }

    if (!validateEmail(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    if (phone.length < 7) {
      showError("Please enter a valid phone number with at least 7 digits.");
      return;
    }

    const loadingToast = showLoading("Placing your order...");
    setIsProcessing(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("roms_token");
      if (!token) {
        dismissToast(loadingToast);
        showError("Please login to place an order");
        navigate("/login");
        return;
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId || item.id || item._id,
          qty: item.quantity,
        })),
        deliveryAddress: `${address}, ${country}`,
        phone: phone,
        notes: `Customer: ${fullname}, Email: ${email}`,
        paymentMethod: paymentMethod,
        deliveryFee: shipping,
      };

      // Validate that all items have menuItemId
      const invalidItems = orderData.items.filter((item) => !item.menuItemId);
      if (invalidItems.length > 0) {
        dismissToast(loadingToast);
        showError(
          "Some items in your cart are invalid. Please remove and re-add them.",
        );
        console.error("Invalid cart items:", invalidItems);
        return;
      }

      // If Stripe payment selected, create checkout session
      if (paymentMethod === "Stripe") {
        console.log("Creating Stripe checkout session...");

        // First create the order with "Pending Payment" status
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        const orderResult = await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(orderResult.message || "Failed to create order");
        }

        const orderId = orderResult.order._id;
        console.log("Order created:", orderId);

        // Now create Stripe checkout session
        const checkoutResponse = await fetch("/api/payments/create-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.img,
            })),
            deliveryFee: shipping,
            customerEmail: email,
            orderId: orderId,
            metadata: {
              orderId: orderId,
              deliveryAddress: `${address}, ${country}`,
              phone: phone,
              customerName: fullname,
            },
          }),
        });

        console.log("Checkout response status:", checkoutResponse.status);

        // Check if response is JSON
        const contentType = checkoutResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await checkoutResponse.text();
          console.error("Non-JSON response:", text.substring(0, 200));
          throw new Error(
            "Server returned invalid response. Please check if backend is running.",
          );
        }

        const checkoutData = await checkoutResponse.json();

        if (!checkoutResponse.ok) {
          throw new Error(
            checkoutData.message || "Failed to create payment session",
          );
        }

        // Clear cart and redirect to Stripe checkout
        setCartItems([]);
        console.log("Redirecting to Stripe:", checkoutData.url);
        window.location.href = checkoutData.url;
        return;
      }

      // For COD, create order directly
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        dismissToast(loadingToast);
        throw new Error(data.message || "Failed to create order");
      }

      // Clear cart and navigate to receipt with orderId in URL
      setCartItems([]);
      dismissToast(loadingToast);
      showOrderPlaced(data.order._id);

      // Send push notification
      try {
        await sendNotification(
          NotificationTemplates.orderPlaced(data.order._id),
        );
      } catch (err) {
        console.log("Push notification failed:", err);
      }

      navigate(`/receipt?orderId=${data.order._id}`);
    } catch (error) {
      console.error("Order creation error:", error);
      showError(`Failed to place order: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white py-12 px-8 rounded-3xl shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4"
            >
              <i className="fas fa-arrow-left text-xl"></i>
              <span className="font-semibold">Back to Cart</span>
            </button>

            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl">
                🛒
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black">
                  Complete Your Order
                </h1>
                <p className="text-orange-100 text-lg mt-1">
                  Just one step away from delicious food! 🍽️
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div
            ref={summaryRef}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 p-8 hover:shadow-3xl transition-all duration-500"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                📦 Order Summary
              </h2>
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {totalCartCount} item{totalCartCount !== 1 && "s"}
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🛒</div>
                <p className="text-gray-500 text-xl font-semibold">
                  No items in your cart
                </p>
                <button
                  onClick={() => navigate("/order")}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold hover:from-orange-600 hover:to-amber-600 hover:scale-105 transition-all shadow-lg"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50">
                {cartItems.map((item, index) => (
                  <div
                    key={item.name + index}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover shadow-md ring-2 ring-orange-200"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23f97316"/><text x="40" y="40" text-anchor="middle" dy=".3em" fill="white" font-size="24">🍽️</text></svg>`;
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-black text-gray-900 text-base mb-1">
                        {item.name}
                      </p>
                      <p className="text-orange-600 font-bold text-sm">
                        {item.quantity} × ৳{item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-black text-xl text-orange-600">
                      ৳{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t-2 border-orange-200 my-6"></div>

            <div className="space-y-4 text-base">
              <div className="flex justify-between items-center p-3 rounded-xl bg-orange-50">
                <span className="text-gray-700 font-semibold">Sub-total</span>
                <span className="font-bold text-gray-900">
                  ৳{subTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-green-50">
                <span className="text-gray-700 font-semibold flex items-center gap-2">
                  <span>🚚</span> Shipping
                </span>
                <span className="font-bold text-green-600">
                  {shipping === 0 ? "FREE" : `৳${shipping.toFixed(2)}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-red-50">
                  <span className="text-gray-700 font-semibold flex items-center gap-2">
                    <span>🎉</span> Discount
                  </span>
                  <span className="font-bold text-red-600">
                    - ৳{discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 rounded-xl bg-blue-50">
                <span className="text-gray-700 font-semibold">Tax & Fees</span>
                <span className="font-bold text-blue-600">
                  + ৳{tax.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t-2 border-orange-200 my-6"></div>

            <div className="flex justify-between items-center p-5 rounded-2xl bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300">
              <span className="text-2xl font-black text-gray-900">
                Total Amount
              </span>
              <span className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                ৳{total.toFixed(2)}
              </span>
            </div>

            {/* Payment Method Selection */}
            <div className="mt-8">
              <h3 className="font-black text-xl text-gray-900 mb-4 flex items-center gap-2">
                <span>💳</span> Payment Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 cursor-pointer transition-all hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg has-[:checked]:border-orange-500 has-[:checked]:bg-gradient-to-r has-[:checked]:from-orange-50 has-[:checked]:to-amber-50 has-[:checked]:shadow-lg">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-6 h-6 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">💵</span>
                      <span className="font-black text-gray-900 text-lg">
                        Cash on Delivery
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Pay with cash when your order arrives
                    </p>
                  </div>
                  {paymentMethod === "COD" && (
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white"></i>
                    </div>
                  )}
                </label>
                <label className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 cursor-pointer transition-all hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg has-[:checked]:border-orange-500 has-[:checked]:bg-gradient-to-r has-[:checked]:from-orange-50 has-[:checked]:to-amber-50 has-[:checked]:shadow-lg">
                  <input
                    type="radio"
                    name="payment"
                    value="Stripe"
                    checked={paymentMethod === "Stripe"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-6 h-6 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">💳</span>
                      <span className="font-black text-gray-900 text-lg">
                        Card Payment (Stripe)
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Secure payment with credit/debit card
                    </p>
                  </div>
                  {paymentMethod === "Stripe" && (
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white"></i>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || cartItems.length === 0}
              className="w-full mt-8 px-8 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xl font-black rounded-2xl hover:from-orange-600 hover:to-amber-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : paymentMethod === "Stripe" ? (
                <span className="flex items-center justify-center gap-2">
                  <span>🔒</span> Proceed to Secure Payment
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🎉</span> Place Order Now
                </span>
              )}
            </button>

            <p className="mt-4 text-sm text-gray-600 text-center lg:hidden flex items-center justify-center gap-2">
              <span>💡</span>
              <span>Fill billing information on the right to continue</span>
            </p>
          </div>

          {/* Billing Info */}
          <div
            ref={billingRef}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 p-8 hover:shadow-3xl transition-all duration-500"
          >
            <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-6">
              📋 Delivery Information
            </h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {[
                {
                  id: "fullname",
                  label: "Full Name",
                  type: "text",
                  placeholder: "Enter your full name",
                  icon: "👤",
                },
                {
                  id: "email",
                  label: "Email Address",
                  type: "email",
                  placeholder: "your.email@example.com",
                  icon: "📧",
                },
                {
                  id: "phone",
                  label: "Phone Number",
                  type: "tel",
                  placeholder: "01712345678",
                  icon: "📱",
                },
                {
                  id: "address",
                  label: "Delivery Address",
                  type: "text",
                  placeholder: "House/Flat, Street, Area, City",
                  icon: "📍",
                },
              ].map(({ id, label, type, placeholder, icon }) => (
                <div key={id}>
                  <label
                    htmlFor={id}
                    className="flex items-center gap-2 font-black text-gray-900 mb-3"
                  >
                    <span className="text-xl">{icon}</span>
                    <span>{label}</span>
                  </label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className="w-full px-5 py-4 bg-orange-50 border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium"
                    value={billing[id]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <div>
                <label
                  htmlFor="country"
                  className="flex items-center gap-2 font-black text-gray-900 mb-3"
                >
                  <span className="text-xl">🌍</span>
                  <span>Country</span>
                </label>
                <select
                  id="country"
                  className="w-full px-5 py-4 bg-orange-50 border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-200 text-gray-900 font-medium"
                  value={billing.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your country</option>
                  <option value="bd">🇧🇩 Bangladesh</option>
                  <option value="us">🇺🇸 United States</option>
                  <option value="uk">🇬🇧 United Kingdom</option>
                  <option value="in">🇮🇳 India</option>
                  <option value="pk">🇵🇰 Pakistan</option>
                </select>
              </div>

              <div className="pt-4">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <p className="text-sm text-blue-900 font-semibold mb-1">
                        Important Information
                      </p>
                      <p className="text-sm text-blue-800">
                        Please double-check all details before placing your
                        order. You can cancel within 5 minutes of order
                        placement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="text-sm text-green-900 font-semibold mb-2">
                        What happens next?
                      </p>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Order confirmation via email & SMS</li>
                        <li>• Real-time order tracking</li>
                        <li>• Estimated delivery: 30-45 minutes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
