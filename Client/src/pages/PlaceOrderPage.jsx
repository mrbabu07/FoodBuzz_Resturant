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
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="container-custom animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
          >
            <i className="fas fa-arrow-left text-xl"></i>
            <span className="font-semibold">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gradient">
            Complete Your Order
          </h1>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div ref={summaryRef} className="card-hover">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order Summary
              </h2>
              <span className="badge-primary text-base">
                {totalCartCount} item{totalCartCount !== 1 && "s"}
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No items in your cart
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 dark:bg-gray-800 border border-orange-100 dark:border-gray-700 hover-lift"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shadow-md"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white text-base">
                        {item.name}
                      </p>
                      <p className="text-orange-600 dark:text-orange-400 font-semibold">
                        {item.quantity} × Tk{item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      Tk{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="divider"></div>

            <div className="space-y-3 text-base">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Sub-total</span>
                <span className="font-semibold">TK {subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Shipping</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {shipping === 0 ? "Free" : `TK ${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Discount</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  - TK {discount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Tax</span>
                <span className="font-semibold">+ TK {tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="divider"></div>

            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Total
              </span>
              <span className="text-2xl font-bold text-gradient">
                TK {total.toFixed(2)}
              </span>
            </div>

            {/* Payment Method Selection */}
            <div className="mt-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">
                Payment Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 dark:has-[:checked]:bg-gray-800">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      💵 Cash on Delivery (COD)
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pay when you receive
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 dark:has-[:checked]:bg-gray-800">
                  <input
                    type="radio"
                    name="payment"
                    value="Stripe"
                    checked={paymentMethod === "Stripe"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      💳 Pay with Card (Stripe)
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Secure online payment
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="btn-primary w-full mt-6 text-lg py-4"
            >
              {isProcessing
                ? "Processing..."
                : paymentMethod === "Stripe"
                  ? "🔒 Proceed to Payment"
                  : "🎉 Place Order"}
            </button>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center lg:hidden">
              💡 Please fill out billing information below to complete your
              order
            </p>
          </div>

          {/* Billing Info */}
          <div ref={billingRef} className="card-hover">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📋 Billing Information
            </h2>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {[
                {
                  id: "fullname",
                  label: "Full Name",
                  type: "text",
                  placeholder: "John Doe",
                  icon: "👤",
                },
                {
                  id: "email",
                  label: "Email Address",
                  type: "email",
                  placeholder: "john@example.com",
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
                  placeholder: "Street, City, ZIP",
                  icon: "📍",
                },
              ].map(({ id, label, type, placeholder, icon }) => (
                <div key={id}>
                  <label
                    htmlFor={id}
                    className="block font-bold text-gray-900 dark:text-white mb-2"
                  >
                    {icon} {label}
                  </label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className="input-modern"
                    value={billing[id]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <div>
                <label
                  htmlFor="country"
                  className="block font-bold text-gray-900 dark:text-white mb-2"
                >
                  🌍 Country
                </label>
                <select
                  id="country"
                  className="input-modern"
                  value={billing.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Country</option>
                  <option value="bd">🇧🇩 Bangladesh</option>
                  <option value="us">🇺🇸 United States</option>
                  <option value="uk">🇬🇧 United Kingdom</option>
                </select>
              </div>

              <div className="pt-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-200 flex items-start gap-2">
                    <span className="text-lg">ℹ️</span>
                    <span>
                      Please ensure all information is correct before placing
                      your order. You can cancel within 5 minutes of placing the
                      order.
                    </span>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
