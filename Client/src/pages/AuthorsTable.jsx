import { useEffect, useState } from "react";
import AdminFooter from "../components/AdminFooter";
import AdminNavbar from "../components/AdminNavbar";

const authors = [
  { id: 1, name: "Fabliha Raidah", email: "fabliha@mail.com" },
  { id: 2, name: "Kanij", email: "kanij@mail.com" },
];

export default function AuthorsTable() {
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const sidebarWidth = navOpen ? 240 : 64;

  const [editMode, setEditMode] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminUser");
    if (storedAdmin) {
      setLoggedInAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const handlePasswordUpdate = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return setMessage("All fields are required.");
    }

    if (newPassword.length < 6) {
      return setMessage("Password must be at least 6 characters.");
    }

    if (newPassword !== confirmPassword) {
      return setMessage("Passwords do not match.");
    }

    // Here you can call your backend API to actually update the password.
    setMessage("✅ Password updated successfully!");
    setEditMode(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Authors Table</h1>

      {!loggedInAdmin && (
        <p className="text-red-600">You are not logged in. Please login first.</p>
      )}

      {loggedInAdmin && (
        <table className="min-w-full border border-gray-300 rounded overflow-hidden">
          <thead className="bg-orange-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-orange-700">Name</th>
              <th className="px-4 py-2 text-left font-semibold text-orange-700">Email</th>
              <th className="px-4 py-2 text-left font-semibold text-orange-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => {
              const isLoggedInUser =
                loggedInAdmin.displayName.toLowerCase().includes(author.name.toLowerCase()) ||
                author.name.toLowerCase().includes(loggedInAdmin.displayName.toLowerCase());

              return (
                <>
                  <tr
                    key={author.id}
                    className={`border-t border-gray-200 ${
                      isLoggedInUser ? "font-bold bg-yellow-100" : ""
                    }`}
                  >
                    <td className="px-4 py-2">{author.name}</td>
                    <td className="px-4 py-2">{author.email}</td>
                    <td className="px-4 py-2">
                      {isLoggedInUser && (
                        <button
                          onClick={() => {
                            setEditMode((prev) => !prev);
                            setMessage(null);
                          }}
                          className="text-sm text-white bg-blue-500 px-4 py-1 rounded-md hover:bg-blue-600 transition"
                        >
                          {editMode ? "Cancel" : "Edit"}
                        </button>
                      )}
                    </td>
                  </tr>

                  {isLoggedInUser && editMode && (
                    <tr className="bg-orange-50 border-t border-orange-200">
                      <td colSpan="3" className="p-4">
                        <div className="space-y-3">
                          <input
                            type="password"
                            placeholder="Old Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-orange-300 rounded-md"
                          />
                          <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-orange-300 rounded-md"
                          />
                          <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-orange-300 rounded-md"
                          />
                          <button
                            onClick={handlePasswordUpdate}
                            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                          >
                            Update Password
                          </button>
                          {message && (
                            <p
                              className={`text-sm ${
                                message.includes("✅")
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {message}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      )}

      <AdminFooter />
    </div>
  );
}
