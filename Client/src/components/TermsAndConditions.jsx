import React from "react";
import { useNavigate } from "react-router-dom";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-sm leading-7 text-gray-800">

      {/* 🔙 Back Button */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-lg sm:text-2xl hover:text-orange-600 transition flex gap-2 items-center"
        >
          <i className="fas fa-arrow-left"></i> 
        </button>
      </div>

      <h1 className="text-3xl font-semibold text-orange-600 mb-6">
        Terms & Conditions
      </h1>

      <p className="mb-4">
        By accessing and using our food ordering platform, you agree to the following Terms and Conditions. Please read them carefully.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">1. Service Overview</h2>
      <p className="mb-4">
        We provide an online platform for users to browse, order, and purchase food and beverages. All products are subject to availability.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">2. Orders & Payments</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>All orders must be paid in full before processing.</li>
        <li>Prices may vary depending on item availability and promotional offers.</li>
        <li>We reserve the right to cancel orders in case of fraudulent activity or unexpected issues.</li>
      </ul>

      <h2 className="text-xl font-bold mt-6 mb-2">3. Delivery</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Estimated delivery times are provided during checkout.</li>
        <li>Delays may occur due to weather, traffic, or other circumstances beyond our control.</li>
      </ul>

      <h2 className="text-xl font-bold mt-6 mb-2">4. Refund Policy</h2>
      <p className="mb-4">
        We offer refunds or replacements for incorrect or spoiled items. Claims must be made within 24 hours of delivery with proof (photo or receipt).
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">5. User Responsibilities</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>You must provide accurate information while placing orders.</li>
        <li>You agree not to misuse the platform or engage in unlawful behavior.</li>
      </ul>

      <h2 className="text-xl font-bold mt-6 mb-2">6. Modifications</h2>
      <p className="mb-4">
        We may update these Terms from time to time. Continued use of the service constitutes acceptance of the new Terms.
      </p>

      <p className="mt-8 text-sm italic text-gray-500">
        Last updated: July 3, 2025
      </p>
    </div>
  );
}
