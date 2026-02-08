import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { showSuccess, showError } from "../utils/toast";

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, increaseQty, decreaseQty, removeFromCart, totalQuantity } =
    useCart();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);

  const validCoupons = {
    SAVE10: { amount: 10, description: "Save ৳10 on your order" },
    FOODIE5: { amount: 5, description: "Foodie special ৳5 off" },
    PIZZA25: { amount: 25, description: "Pizza lovers ৳25 discount" },
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (validCoupons[code]) {
      setAppliedCoupon({ code, ...validCoupons[code] });
      showSuccess(
        `Coupon ${code} applied! You saved ৳${validCoupons[code].amount}`,
      );
      setCouponInput("");
    } else {
      setAppliedCoupon(null);
      showError("Invalid coupon code. Please try again.");
    }
  };

  const handleRemoveItem = (itemName) => {
    setRemovingItem(itemName);
    setTimeout(() => {
      removeFromCart(itemName);
      setRemovingItem(null);
      showSuccess("Item removed from cart");
    }, 300);
  };

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const FREE_DELIVERY_THRESHOLD = 500;
  const deliveryCharge = subTotal >= FREE_DELIVERY_THRESHOLD ? 0 : 50;
  const discount = appliedCoupon?.amount || 0;
  const tax = Math.round(subTotal * 0.05); // 5% tax
  const total = subTotal + deliveryCharge - discount + tax;

  const handleCheckoutClick = (e) => {
    if (totalQuantity === 0) {
      e.preventDefault();
      showError("Please add at least one item to your cart");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white py-12 px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate(-1)}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
              >
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <div>
                <h1 className="text-4xl font-black mb-2">🛒 Your Cart</h1>
                <p className="text-white/90 text-lg">
                  {totalQuantity === 0
                    ? "Your cart is empty"
                    : `${totalQuantity} item${totalQuantity > 1 ? "s" : ""} in your cart`}
                </p>
              </div>
            </div>
            {totalQuantity > 0 && (
              <div className="hidden md:block text-right">
                <div className="text-5xl font-black">৳{total.toFixed(0)}</div>
                <div className="text-white/80 text-sm">Total Amount</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              {cartItems.map((item) => (
                <CartItem
                  key={item.name}
                  item={item}
                  onIncrease={() => increaseQty(item.name)}
                  onDecrease={() => decreaseQty(item.name)}
                  onRemove={() => handleRemoveItem(item.name)}
                  isRemoving={removingItem === item.name}
                />
              ))}

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link
                  to="/order_1st"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border-2 border-orange-500 text-orange-600 font-bold rounded-xl hover:bg-orange-50 hover:scale-105 transition-all shadow-lg"
                >
                  <i className="fas fa-shopping-bag"></i>
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            subTotal={subTotal}
            deliveryCharge={deliveryCharge}
            discount={discount}
            tax={tax}
            total={total}
            couponInput={couponInput}
            setCouponInput={setCouponInput}
            applyCoupon={applyCoupon}
            appliedCoupon={appliedCoupon}
            validCoupons={validCoupons}
            totalQuantity={totalQuantity}
            handleCheckoutClick={handleCheckoutClick}
            freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
          />
        </div>
      </div>
    </div>
  );
}

// Empty Cart Component
function EmptyCart() {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-100 p-12 text-center">
      <div className="text-9xl mb-6 animate-bounce">🛒</div>
      <h2 className="text-4xl font-black text-gray-900 mb-4">
        Your Cart is Empty
      </h2>
      <p className="text-gray-600 text-lg mb-8">
        Looks like you haven't added anything to your cart yet
      </p>
      <Link
        to="/order_1st"
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 hover:scale-105 transition-all shadow-xl"
      >
        <i className="fas fa-utensils"></i>
        Browse Menu
      </Link>
    </div>
  );
}

// Cart Item Component
function CartItem({ item, onIncrease, onDecrease, onRemove, isRemoving }) {
  return (
    <div
      className={`group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden hover:shadow-2xl transition-all duration-300 ${
        isRemoving ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="p-6 flex gap-6">
        {/* Image */}
        <div className="relative flex-shrink-0">
          <img
            src={item.image || item.img}
            alt={item.name}
            className="w-28 h-28 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform"
          />
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
            title="Remove item"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {item.name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-orange-600">
                ৳{item.price}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-lg text-gray-400 line-through">
                  ৳{item.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-3 bg-orange-50 rounded-xl px-4 py-2 border-2 border-orange-200">
              <button
                onClick={onDecrease}
                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-orange-100 hover:scale-110 transition-all shadow-sm"
              >
                <i className="fas fa-minus text-orange-600 text-sm"></i>
              </button>
              <span className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={onIncrease}
                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-orange-100 hover:scale-110 transition-all shadow-sm"
              >
                <i className="fas fa-plus text-orange-600 text-sm"></i>
              </button>
            </div>
            <div className="text-right flex-1">
              <div className="text-sm text-gray-500">Subtotal</div>
              <div className="text-2xl font-black text-gray-900">
                ৳{(item.price * item.quantity).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Order Summary Component
function OrderSummary({
  subTotal,
  deliveryCharge,
  discount,
  tax,
  total,
  couponInput,
  setCouponInput,
  applyCoupon,
  appliedCoupon,
  validCoupons,
  totalQuantity,
  handleCheckoutClick,
  freeDeliveryThreshold,
}) {
  const deliveryProgress = Math.min(
    (subTotal / freeDeliveryThreshold) * 100,
    100,
  );
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subTotal);

  return (
    <div className="space-y-6 lg:sticky lg:top-6">
      {/* Order Summary Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-100 p-6">
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <i className="fas fa-receipt text-orange-600"></i>
          Order Summary
        </h2>

        {/* Free Delivery Progress */}
        {deliveryCharge > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">
                🚚 Free Delivery Progress
              </span>
              <span className="text-sm font-bold text-orange-600">
                {deliveryProgress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${deliveryProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600">
              Add ৳{amountToFreeDelivery} more to get free delivery!
            </p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span className="font-bold">৳{subTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Delivery Fee</span>
            <span
              className={`font-bold ${deliveryCharge === 0 ? "text-green-600" : ""}`}
            >
              {deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge}`}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-2">
                Discount
                {appliedCoupon && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                    {appliedCoupon.code}
                  </span>
                )}
              </span>
              <span className="font-bold">-৳{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-700">
            <span>Tax (5%)</span>
            <span className="font-bold">৳{tax}</span>
          </div>
          <div className="border-t-2 border-orange-200 pt-3 flex justify-between text-xl font-black text-gray-900">
            <span>Total</span>
            <span className="text-orange-600">৳{total.toFixed(0)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Link
          to={totalQuantity === 0 ? "#" : "/place_order"}
          onClick={handleCheckoutClick}
          className={`block w-full py-4 rounded-xl font-bold text-center transition-all shadow-lg ${
            totalQuantity === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:scale-105"
          }`}
        >
          {totalQuantity === 0 ? "Cart is Empty" : "Proceed to Checkout"}
        </Link>
      </div>

      {/* Coupon Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-orange-100 p-6">
        <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
          <i className="fas fa-tag text-orange-600"></i>
          Apply Coupon
        </h3>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === "Enter" && applyCoupon()}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none font-bold"
          />
          <button
            onClick={applyCoupon}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 hover:scale-105 transition-all shadow-lg"
          >
            Apply
          </button>
        </div>

        {/* Available Coupons */}
        <div className="space-y-2">
          <p className="text-sm font-bold text-gray-700 mb-2">
            Available Coupons:
          </p>
          {Object.entries(validCoupons).map(
            ([code, { amount, description }]) => (
              <div
                key={code}
                onClick={() => {
                  setCouponInput(code);
                  applyCoupon();
                }}
                className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 cursor-pointer hover:border-orange-400 hover:scale-105 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black text-orange-600">{code}</div>
                    <div className="text-xs text-gray-600">{description}</div>
                  </div>
                  <div className="text-lg font-black text-orange-600">
                    ৳{amount}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
