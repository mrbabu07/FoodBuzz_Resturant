import React, { useState, useEffect } from "react";
import OfferModal from "../components/OfferModal";

export default function TestOffersPage() {
  const [offers, setOffers] = useState([]);
  const [modalOffers, setModalOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);

      // Fetch active offers
      const activeResponse = await fetch("/api/offers/active");
      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        setOffers(activeData);
      }

      // Fetch modal offers
      const modalResponse = await fetch("/api/offers/modal");
      if (modalResponse.ok) {
        const modalData = await modalResponse.json();
        setModalOffers(modalData);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-orange-600 mb-4">
            🎯 Offer System Test
          </h1>
          <p className="text-gray-600 text-lg">
            Testing the offer system functionality
          </p>
        </div>

        {/* Test Modal Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 hover:scale-105 transition-all"
          >
            🎉 Test Offer Modal ({modalOffers.length} offers)
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl font-black">{offers.length}</div>
            <div className="text-orange-100">Active Offers</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl font-black">{modalOffers.length}</div>
            <div className="text-green-100">Modal Offers</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl font-black">
              {offers.filter((o) => o.discountType === "percentage").length}
            </div>
            <div className="text-blue-100">Percentage Offers</div>
          </div>
        </div>

        {/* Active Offers List */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            All Active Offers
          </h2>

          {offers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No active offers
              </h3>
              <p className="text-gray-600">
                No offers are currently active or available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all"
                  style={{
                    backgroundColor: offer.backgroundColor + "10",
                    borderColor: offer.backgroundColor + "30",
                  }}
                >
                  {/* Offer Preview */}
                  <div
                    className="rounded-xl p-4 mb-4 text-center"
                    style={{
                      backgroundColor: offer.backgroundColor,
                      color: offer.textColor,
                    }}
                  >
                    <div className="text-2xl font-black mb-2">
                      {getDiscountDisplay(offer)}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
                    <p className="text-sm opacity-90">{offer.description}</p>
                  </div>

                  {/* Offer Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold capitalize">
                        {offer.discountType.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className="font-semibold">
                        {new Date(offer.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    {offer.minimumOrderAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Order:</span>
                        <span className="font-semibold">
                          ${offer.minimumOrderAmount}
                        </span>
                      </div>
                    )}
                    {offer.usageLimit && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usage:</span>
                        <span className="font-semibold">
                          {offer.usageCount}/{offer.usageLimit}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">
                      Active
                    </span>
                    {offer.showAsModal && (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600">
                        Modal
                      </span>
                    )}
                    {offer.applicableCategories.length > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-600">
                        Category Specific
                      </span>
                    )}
                  </div>

                  {/* Offer Code */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Use Code:</div>
                    <code className="text-sm font-bold text-gray-900">
                      OFFER{offer._id.slice(-6).toUpperCase()}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Test Results */}
        <div className="mt-8 bg-gray-50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🧪 API Test Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>GET /api/offers/active:</strong>
              <div className="text-green-600">
                ✅ {offers.length} offers loaded
              </div>
            </div>
            <div>
              <strong>GET /api/offers/modal:</strong>
              <div className="text-green-600">
                ✅ {modalOffers.length} modal offers loaded
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      <OfferModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
