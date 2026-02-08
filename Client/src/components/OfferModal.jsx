import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function OfferModal({ isOpen, onClose }) {
  const [offers, setOffers] = useState([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchModalOffers();
    }
  }, [isOpen]);

  const fetchModalOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/offers/modal");

      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      }
    } catch (error) {
      console.error("Error fetching modal offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextOffer = () => {
    setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
  };

  const prevOffer = () => {
    setCurrentOfferIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const getDiscountDisplay = (offer) => {
    switch (offer.discountType) {
      case "percentage":
        return `${offer.discountValue}% OFF`;
      case "fixed":
        return `$${offer.discountValue} OFF`;
      case "bogo":
        return "BUY 1 GET 1";
      case "free_delivery":
        return "FREE DELIVERY";
      default:
        return "SPECIAL OFFER";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const copyOfferCode = (offerId) => {
    const code = `OFFER${offerId.slice(-6).toUpperCase()}`;
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  if (!isOpen || loading) return null;

  if (offers.length === 0) return null;

  const currentOffer = offers[currentOfferIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
          >
            <span className="text-xl">✕</span>
          </button>

          <div className="text-center">
            <div className="text-2xl font-black mb-2">🎉 Welcome Back!</div>
            <p className="text-white/90">
              Check out our exclusive offers just for you!
            </p>
          </div>
        </div>

        {/* Offer Content */}
        <div className="p-8">
          <div
            className="rounded-2xl p-8 text-center mb-6 relative overflow-hidden"
            style={{
              backgroundColor: currentOffer.backgroundColor,
              color: currentOffer.textColor,
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-16 h-16 border-2 border-current rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-current rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-current rounded-full"></div>
            </div>

            <div className="relative z-10">
              {/* Discount Badge */}
              <div className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full mb-4">
                <div className="text-3xl font-black">
                  {getDiscountDisplay(currentOffer)}
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-black mb-3">{currentOffer.title}</h2>
              <p className="text-lg opacity-90 mb-6">
                {currentOffer.description}
              </p>

              {/* Offer Details */}
              <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
                {currentOffer.minimumOrderAmount > 0 && (
                  <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Min Order: ${currentOffer.minimumOrderAmount}
                  </div>
                )}
                <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  Valid until {formatDate(currentOffer.validUntil)}
                </div>
                {currentOffer.usageLimit && (
                  <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Limited Time:{" "}
                    {currentOffer.usageLimit - currentOffer.usageCount} left
                  </div>
                )}
              </div>

              {/* Offer Code */}
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 mb-6">
                <div className="text-sm opacity-80 mb-1">Use Code:</div>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-xl font-black tracking-wider">
                    OFFER{currentOffer._id.slice(-6).toUpperCase()}
                  </code>
                  <button
                    onClick={() => copyOfferCode(currentOffer._id)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-sm font-bold transition-all"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Link
                  to="/order_1st"
                  onClick={onClose}
                  className="px-8 py-3 bg-white text-gray-900 rounded-xl font-black hover:scale-105 transition-all shadow-lg"
                >
                  {currentOffer.buttonText}
                </Link>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl font-bold hover:bg-opacity-30 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {offers.length > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={prevOffer}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
              >
                <span className="text-xl">←</span>
              </button>

              <div className="flex items-center gap-2">
                {offers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentOfferIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentOfferIndex
                        ? "bg-orange-500 w-8"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextOffer}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
              >
                <span className="text-xl">→</span>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>🎯 More exclusive offers available in your account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
