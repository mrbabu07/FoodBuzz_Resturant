import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    totalQuantity,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponNotice, setCouponNotice] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const validCoupons = {
    SAVE10: 10,
    FOODIE5: 5,
    PIZZA25: 25,
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (validCoupons[code]) {
      setAppliedCoupon({ code, amount: validCoupons[code] });
      showCouponNotice("Coupon Applied!");
    } else {
      setAppliedCoupon(null);
      showCouponNotice("Invalid coupon!");
    }
  };

  const showCouponNotice = (message) => {
    setCouponNotice(message);
    setTimeout(() => setCouponNotice(false), 2000);
  };

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const deliveryCharge = 0;
  const discount = appliedCoupon?.amount || 0;
  const tax = 7.11;
  const total = subTotal + deliveryCharge - discount + tax;

  const handleCheckoutClick = (e) => {
    if (totalQuantity === 0) {
      e.preventDefault(); // লিঙ্ক ফলো বন্ধ করে দিবে
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000); // ৩ সেকেন্ড পরে মেসেজ অদৃশ্য হবে
    }
  };

  return (
    <div className="bg-white text-black font-sans p-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl hover:text-orange-600 transition"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <span className="text-lg font-semibold">Cart Items: {totalQuantity}</span>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items Table */}
        <div className="col-span-2 bg-white rounded-md p-6 shadow-[0_2px_8px_rgba(247,105,40,0.3)]">
          <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
<div className="overflow-x-auto">
  <table className="w-full text-left border-t text-sm sm:text-base">
    <thead className="text-xs sm:text-sm text-gray-500 border-b">
      <tr>
        <th className="py-2 px-2">Selected Food Item</th>
        <th className="py-2 px-2">PRICE</th>
        <th className="py-2 px-2">QUANTITY</th>
        <th className="py-2 px-2">SUB-TOTAL</th>
      </tr>
    </thead>
    <tbody>
      {cartItems.length === 0 ? (
        <tr>
          <td colSpan={4} className="text-center py-10 text-sm">
            Cart is empty.
          </td>
        </tr>
      ) : (
        cartItems.map((item) => (
          <tr key={item.name} className="border-b text-xs sm:text-sm">
            <td className="py-3 px-2 flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => removeFromCart(item.name)}
                className="text-gray-400 hover:text-red-600"
                title="Remove item"
              >
                <span className="material-icons text-base sm:text-lg">close</span>
              </button>
              <img
                src={item.img}
                alt={item.name}
                className="w-10 h-10 sm:w-14 sm:h-14 object-cover rounded"
              />
              <span className="font-medium">{item.name}</span>
            </td>
            <td className="py-3 px-2">
              <span className="text-orange-600 font-semibold">
                TK{item.price.toFixed(2)}
              </span>
              <br />
              <span className="line-through text-xs text-gray-400">
                TK{item.originalPrice?.toFixed(2) || "0.00"}
              </span>
            </td>
            <td className="py-3 px-2">
              <div className="flex items-center border rounded-full px-2 py-1 w-fit gap-1">
                <button
                  onClick={() => removeFromCart(item.name)}
                  className="text-red-500 hover:text-red-600"
                  title="Delete item"
                >
                  <span className="material-icons text-sm">delete</span>
                </button>
                <span className="mx-1 text-xs sm:text-sm">{item.quantity}</span>
                <button
                  onClick={() => increaseQty(item.name)}
                  className="text-gray-700 hover:text-black"
                  title="Increase quantity"
                >
                  <span className="material-icons text-sm">add</span>
                </button>
                <button
                  onClick={() => decreaseQty(item.name)}
                  className="text-gray-700 hover:text-black"
                  title="Decrease quantity"
                >
                  <span className="material-icons text-sm">remove</span>
                </button>
              </div>
            </td>
            <td className="py-3 px-2 font-medium">
              TK{(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>


          <div className="mt-6">
            <Link
    to="/order_1st"
    className="border border-orange-500 text-orange-500 px-4 py-2 rounded hover:bg-orange-100 transition"
  >
    Shop More
  </Link>
          </div>
        </div>

        {/* Summary & Coupon */}
        <SummaryCouponSection
          subTotal={subTotal}
          deliveryCharge={deliveryCharge}
          discount={discount}
          tax={tax}
          total={total}
          couponInput={couponInput}
          setCouponInput={setCouponInput}
          applyCoupon={applyCoupon}
          appliedCoupon={appliedCoupon}
          totalQuantity={totalQuantity}
          showAlert={showAlert}
          setShowAlert={setShowAlert}
          handleCheckoutClick={handleCheckoutClick}
        />
      </div>

      {/* Coupon Notice */}
      <div
        className={`fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-500 z-50
          ${couponNotice ? "opacity-100 translate-x-0" : "opacity-0 translate-x-40"}`}
      >
        {couponNotice}
      </div>
    </div>
  );
}

const SummaryCouponSection = ({
  subTotal,
  deliveryCharge,
  discount,
  tax,
  total,
  couponInput,
  setCouponInput,
  applyCoupon,
  appliedCoupon,
  totalQuantity,
  handleCheckoutClick,
  showAlert,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-md p-6 shadow-[0_2px_8px_rgba(247,105,40,0.3)]">
        <h2 className="text-lg font-semibold mb-4">Cart Total</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Sub-total</span>
            <span>TK{subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{deliveryCharge === 0 ? "Free" : `$${deliveryCharge.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ""}</span>
            <span>- TK{discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-orange-600">
            <span>Tax</span>
            <span>+ TK{tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-semibold text-black text-base">
            <span>Total</span>
            <span>TK{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          className={`w-full mt-6 bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition ${
            totalQuantity === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Link
            to={totalQuantity === 0 ? "#" : "/place_order"}
            className="block w-full h-full"
            onClick={handleCheckoutClick}
          >
            Proceed to Checkout
          </Link>
        </button>

        {showAlert && (
          <p className="mt-2 text-red-600 font-semibold text-center">
            Please add at least one item to place order.
          </p>
        )}
      </div>

      {/* Coupon Code */}
      <div className="bg-white rounded-md p-6 shadow-[0_2px_8px_rgba(247,105,40,0.3)]">
        <h2 className="text-lg font-semibold mb-4">Coupon Code</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Coupon Code"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            className="w-full border px-4 py-2 rounded outline-orange-500"
          />
          <button
            onClick={applyCoupon}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
          >
            Apply Coupon
          </button>
        </div>

        {/* Available Coupons List */}
        <div className="mt-4 text-sm">
          <p className="font-medium text-gray-700 mb-1">Available Coupons:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>
              <span className="font-semibold text-orange-600">SAVE10</span> → TK10 discount
            </li>
            <li>
              <span className="font-semibold text-orange-600">FOODIE5</span> → TK5 discount
            </li>
            <li>
              <span className="font-semibold text-orange-600">PIZZA25</span> → TK25 discount
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
