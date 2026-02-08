import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

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
  const [profileUser, setProfileUser] = useState(null);
  const [homePageReviewIds, setHomePageReviewIds] = useState([]);

  const filteredUsers = users.filter((u) =>
    filter === "All" ? true : u.status.toLowerCase() === filter.toLowerCase(),
  );

  const toggleBlockUser = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "active" ? "blocked" : "active" }
          : user,
      ),
    );
  };

  const displayedReviews = selectedUserId
    ? initialReviews.filter((r) => r.userId === selectedUserId)
    : initialReviews;

  const openProfile = (userId) => {
    const user = users.find((u) => u.id === userId);
    setProfileUser(user);
  };

  const toggleHomePageReview = (reviewId) => {
    setHomePageReviewIds((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId],
    );
  };

  const displaySelectedReviews = () => {
    if (homePageReviewIds.length === 0) {
      alert("Please select at least one review to display on home page.");
      return;
    }
    alert(
      "Selected review IDs to display on home page: " +
        homePageReviewIds.join(", "),
    );
  };

  return (
    <AdminLayout
      title="User Management & Reports"
      subtitle="Manage users, reviews, and analytics"
      icon="📊"
    >
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-black">{users.length}</div>
          <div className="text-sm font-semibold opacity-90">Total Users</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-black">
            {users.filter((u) => u.status === "active").length}
          </div>
          <div className="text-sm font-semibold opacity-90">Active Users</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">🚫</div>
          <div className="text-3xl font-black">
            {users.filter((u) => u.status === "blocked").length}
          </div>
          <div className="text-sm font-semibold opacity-90">Blocked Users</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-3xl font-black">{initialReviews.length}</div>
          <div className="text-sm font-semibold opacity-90">Total Reviews</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-6 mb-8">
        <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
          <span className="text-3xl">🔍</span>
          Filter Users
        </h2>
        <div className="flex gap-3 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                setSelectedUserId(null);
              }}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                filter === cat
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 overflow-hidden mb-8">
        <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="text-3xl">👥</span>
            Users List
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">
                  Reviews
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="text-6xl mb-4">👤</div>
                    <p className="text-slate-600 text-lg font-semibold">
                      No users found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-orange-50 transition-colors cursor-pointer ${
                      selectedUserId === user.id ? "bg-orange-100" : ""
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/48x48/f97316/white?text=User")
                          }
                        />
                        <div>
                          <div className="font-bold text-slate-800">
                            {user.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            {user.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{user.email}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-bold ${
                          user.status === "active"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {user.status === "active" ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-black text-orange-600">
                        {user.reviews}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBlockUser(user.id);
                          }}
                          className={`px-4 py-2 rounded-xl text-white text-sm font-bold transition-all hover:scale-105 ${
                            user.status === "active"
                              ? "bg-gradient-to-r from-red-500 to-rose-500"
                              : "bg-gradient-to-r from-green-500 to-emerald-500"
                          }`}
                        >
                          {user.status === "active" ? "Block" : "Unblock"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openProfile(user.id);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold hover:scale-105 transition-all"
                        >
                          View Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-orange-100 p-8 mb-8">
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <span className="text-3xl">⭐</span>
          Reviews
          {selectedUserId &&
            ` - ${users.find((u) => u.id === selectedUserId)?.name}`}
          {!selectedUserId && " - All Users"}
        </h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {displayedReviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-slate-600 text-lg font-semibold">
                No reviews to show
              </p>
            </div>
          ) : (
            displayedReviews.map((review) => {
              const user = users.find((u) => u.id === review.userId);
              return (
                <div
                  key={review.id}
                  className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200 hover:border-orange-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={user?.photo}
                          alt={user?.name}
                          className="w-10 h-10 rounded-full border-2 border-orange-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800">
                            {user?.name || "Unknown"}
                          </p>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < review.rating
                                    ? "text-yellow-500"
                                    : "text-slate-300"
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-700 ml-13">{review.message}</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={homePageReviewIds.includes(review.id)}
                        onChange={() => toggleHomePageReview(review.id)}
                        className="w-6 h-6 rounded-lg border-2 border-slate-300 text-orange-500 focus:ring-4 focus:ring-orange-100"
                      />
                      <span className="text-sm font-semibold text-slate-600">
                        Show on Home
                      </span>
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <button
          onClick={displaySelectedReviews}
          className="mt-6 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          Display Selected Reviews on Home Page
        </button>
      </div>

      {/* Profile Modal */}
      {profileUser && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setProfileUser(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black">User Profile</h2>
                <button
                  onClick={() => setProfileUser(null)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-6">
                <img
                  src={profileUser.photo}
                  alt={profileUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-200"
                  onError={(e) =>
                    (e.target.src =
                      "https://placehold.co/96x96/f97316/white?text=User")
                  }
                />
                <div>
                  <h3 className="text-3xl font-black text-slate-800">
                    {profileUser.name}
                  </h3>
                  <p className="text-slate-600 text-lg">{profileUser.email}</p>
                  <p className="text-slate-600">{profileUser.address}</p>
                  <span
                    className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-bold ${
                      profileUser.status === "active"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {profileUser.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Orders */}
              <div>
                <h4 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  Orders
                </h4>
                {profileUser.orders.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No orders yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {profileUser.orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border-2 border-slate-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {order.item}
                          </span>
                          <span className="text-sm text-slate-600">
                            {order.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div>
                <h4 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  Reviews
                </h4>
                {initialReviews.filter((r) => r.userId === profileUser.id)
                  .length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No reviews yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {initialReviews
                      .filter((r) => r.userId === profileUser.id)
                      .map((r) => (
                        <div
                          key={r.id}
                          className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border-2 border-slate-200"
                        >
                          <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < r.rating
                                    ? "text-yellow-500"
                                    : "text-slate-300"
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <p className="text-slate-700">{r.message}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
