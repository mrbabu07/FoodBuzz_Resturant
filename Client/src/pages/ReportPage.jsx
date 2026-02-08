import React, { useState } from "react";
import AdminFooter from "../components/AdminFooter";
import AdminNavbar from "../components/AdminNavbar";

const categories = ["All", "Active", "Blocked"];

const initialUsers = [
  {
    id: 1,
    name: "Rafiq",
    email: "rafiq@mail.com",
    status: "active",
    reviews: 5,
    photo: "https://randomuser.me/api/portraits/men/1.jpg",
    address: "Dhaka, Bangladesh",
    orders: [
      { id: 1, item: "Beef Burger", date: "2025-07-01" },
      { id: 2, item: "Chicken Fry", date: "2025-07-05" },
    ],
  },
  {
    id: 2,
    name: "Sumaiya",
    email: "sumaiya@mail.com",
    status: "blocked",
    reviews: 2,
    photo: "https://randomuser.me/api/portraits/women/2.jpg",
    address: "Chittagong, Bangladesh",
    orders: [{ id: 3, item: "Fish Curry", date: "2025-06-20" }],
  },
  {
    id: 3,
    name: "Jamal",
    email: "jamal@mail.com",
    status: "active",
    reviews: 8,
    photo: "https://randomuser.me/api/portraits/men/3.jpg",
    address: "Khulna, Bangladesh",
    orders: [
      { id: 4, item: "Soup", date: "2025-07-10" },
      { id: 5, item: "Dessert", date: "2025-07-12" },
    ],
  },
  {
    id: 4,
    name: "Ayesha",
    email: "ayesha@mail.com",
    status: "active",
    reviews: 1,
    photo: "https://randomuser.me/api/portraits/women/4.jpg",
    address: "Sylhet, Bangladesh",
    orders: [],
  },
];

const initialReviews = [
  { id: 1, userId: 1, message: "Great service!", rating: 5 },
  { id: 2, userId: 1, message: "Loved the burger!", rating: 4 },
  { id: 3, userId: 1, message: "Will order again.", rating: 5 },
  { id: 4, userId: 1, message: "Good packaging.", rating: 4 },
  { id: 5, userId: 1, message: "Fast delivery.", rating: 5 },

  { id: 6, userId: 3, message: "Could be better.", rating: 3 },
  { id: 7, userId: 4, message: "Loved it!", rating: 4 },
  { id: 8, userId: 2, message: "Late delivery.", rating: 2 },
];

export default function ReportPage() {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState("All");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [profileUser, setProfileUser] = useState(null); // for modal

  const [offers, setOffers] = useState([]);
  const [offerText, setOfferText] = useState("");

  const [navOpen, setNavOpen] = useState(false);

  const sidebarWidth = navOpen ? 240 : 64;

  // MULTI select for home page reviews:
  const [homePageReviewIds, setHomePageReviewIds] = useState([]);

  // Filtered user list based on filter
  const filteredUsers = users.filter((u) =>
    filter === "All" ? true : u.status.toLowerCase() === filter.toLowerCase(),
  );

  // Block/unblock user toggle
  const toggleBlockUser = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "active" ? "blocked" : "active" }
          : user,
      ),
    );
  };

  // Reviews of selected user or all if none selected
  const displayedReviews = selectedUserId
    ? initialReviews.filter((r) => r.userId === selectedUserId)
    : initialReviews;

  // Add offer
  const addOffer = (e) => {
    e.preventDefault();
    if (!offerText.trim()) return;
    setOffers((prev) => [...prev, offerText.trim()]);
    setOfferText("");
  };

  // Open user profile modal
  const openProfile = (userId) => {
    const user = users.find((u) => u.id === userId);
    setProfileUser(user);
  };

  // Close profile modal
  const closeProfile = () => {
    setProfileUser(null);
  };

  // Toggle review select for home page display (multi)
  const toggleHomePageReview = (reviewId) => {
    setHomePageReviewIds((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId],
    );
  };

  // Handle display reviews button click (just alert here, you can connect to backend)
  const displaySelectedReviews = () => {
    if (homePageReviewIds.length === 0) {
      alert("Please select at least one review to display on home page.");
      return;
    }
    alert(
      "Selected review IDs to display on home page: " +
        homePageReviewIds.join(", "),
    );
    // এখানে তুমি API কল করে সার্ভারে পাঠাতে পারো।
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-10 max-w-7xl mx-auto transition-all duration-300"
      style={{ marginLeft: navOpen ? 240 : 64 }}
    >
      <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />
      <h1 className="text-3xl font-bold mb-4 text-orange-600 mt-10 md:mt-0">
        User Management & Reports
      </h1>

      {/* ====== User Filter Nav ====== */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Filter Users</h2>
        <div className="flex gap-3 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full border ${
                filter === cat
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 border-orange-400"
              } hover:bg-orange-100`}
              onClick={() => {
                setFilter(cat);
                setSelectedUserId(null);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ====== User List Section ====== */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="overflow-x-auto rounded shadow border border-gray-300">
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-orange-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-orange-700 uppercase">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-orange-700 uppercase">
                  Email
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-orange-700 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-orange-700 uppercase">
                  Reviews
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-orange-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-orange-50 cursor-pointer ${
                    selectedUserId === user.id ? "bg-orange-100" : ""
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/40x40/f97316/white?text=User")
                      }
                    />
                    {user.name}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 text-center capitalize">
                    {user.status === "active" ? (
                      <span className="text-green-600 font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{user.reviews}</td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBlockUser(user.id);
                      }}
                      className={`px-3 py-1 rounded text-white text-sm ${
                        user.status === "active"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {user.status === "active" ? "Block" : "Unblock"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openProfile(user.id);
                      }}
                      className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ====== Reviews Section with multi-select for home page ====== */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Reviews{" "}
          {selectedUserId &&
            `(User: ${users.find((u) => u.id === selectedUserId)?.name})`}
          {!selectedUserId && "(All Users)"}
        </h2>
        <div className="bg-white rounded shadow border border-gray-300 p-4 max-h-60 overflow-y-auto">
          {displayedReviews.length === 0 ? (
            <p className="text-center text-gray-500">No reviews to show.</p>
          ) : (
            displayedReviews.map((review) => {
              const user = users.find((u) => u.id === review.userId);
              return (
                <div
                  key={review.id}
                  className="mb-3 border-b border-gray-200 pb-2 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{user?.name || "Unknown"}</p>
                    <p className="text-gray-700">{review.message}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={homePageReviewIds.includes(review.id)}
                    onChange={() => toggleHomePageReview(review.id)}
                    className="ml-4 cursor-pointer"
                    title="Select review to display on home page"
                  />
                </div>
              );
            })
          )}
        </div>
        <button
          onClick={displaySelectedReviews}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
        >
          Display Selected Reviews on Home Page
        </button>
      </section>

      {/* ====== Add Offer Section ====== */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Add Offer</h2>
        <form
          onSubmit={addOffer}
          className="flex flex-col sm:flex-row gap-3 max-w-xl"
          autoComplete="off"
        >
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Write your offer here..."
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-orange-500 text-white rounded px-5 py-2 hover:bg-orange-600 transition"
          >
            Add Offer
          </button>
        </form>

        {offers.length > 0 && (
          <div className="mt-6 max-w-xl space-y-2">
            <h3 className="font-semibold mb-2">Current Offers:</h3>
            <ul className="list-disc list-inside">
              {offers.map((offer, i) => (
                <li key={i} className="text-gray-700">
                  {offer}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ====== Profile Modal ====== */}
      {profileUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={closeProfile}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeProfile}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl font-bold"
              title="Close"
            >
              &times;
            </button>
            <div className="flex items-center gap-5 mb-4">
              <img
                src={profileUser.photo}
                alt={profileUser.name}
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) =>
                  (e.target.src =
                    "https://placehold.co/80x80/f97316/white?text=User")
                }
              />
              <div>
                <h3 className="text-2xl font-bold">{profileUser.name}</h3>
                <p className="text-gray-600">{profileUser.email}</p>
                <p className="text-gray-600">{profileUser.address}</p>
                <p
                  className={`mt-1 font-semibold ${
                    profileUser.status === "active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {profileUser.status.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-lg mb-2">Orders</h4>
              {profileUser.orders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <ul className="list-disc list-inside max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                  {profileUser.orders.map((order) => (
                    <li key={order.id} className="text-gray-700">
                      {order.item} -{" "}
                      <span className="text-sm text-gray-500">
                        {order.date}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Reviews</h4>
              {initialReviews.filter((r) => r.userId === profileUser.id)
                .length === 0 ? (
                <p className="text-gray-500">No reviews yet.</p>
              ) : (
                <ul className="list-disc list-inside max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                  {initialReviews
                    .filter((r) => r.userId === profileUser.id)
                    .map((r) => (
                      <li key={r.id} className="text-gray-700">
                        {r.message}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      <AdminFooter />
    </div>
  );
}
