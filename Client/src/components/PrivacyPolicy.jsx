import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
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
        Privacy Policy
      </h1>

      <p className="mb-4">
        We value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our food ordering platform.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">1. Information We Collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Personal Information: Name, email, phone number, delivery address.</li>
        <li>Order Details: Items ordered, transaction amount, payment method.</li>
        <li>Technical Info: Browser type, device info, IP address (for analytics & security).</li>
      </ul>

      <h2 className="text-xl font-bold mt-6 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>To process your orders and ensure smooth delivery.</li>
        <li>To send order updates, promotional offers, and support-related messages.</li>
        <li>To improve our platform through analytics and user feedback.</li>
      </ul>

      <h2 className="text-xl font-bold mt-6 mb-2">3. Data Sharing</h2>
      <p className="mb-4">
        We do not sell your data. We may share information with trusted third parties (like delivery partners or payment processors) only as needed to fulfill your order.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">4. Data Security</h2>
      <p className="mb-4">
        We take reasonable steps to protect your personal information from loss, misuse, and unauthorized access. But remember — no method is 100% secure.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">5. Your Rights</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>You can request to view, edit, or delete your data anytime.</li>
        <li>You can opt-out of promotional messages by updating your preferences.</li>
      </ul>

      <h2 className="text-xl font-bold mt-6 mb-2">6. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy. When we do, we'll update the date below. Please review it periodically.
      </p>

      <p className="mt-8 text-sm italic text-gray-500">
        Last updated: July 3, 2025
      </p>
    </div>
  );
}
