// // src/pages/ManageMenuPage.jsx
// import React, { useState, useEffect } from "react";
// import AdminFooter from "../components/AdminFooter";
// import AdminNavbar from "../components/AdminNavbar";
// import { getToken } from "../utils/authStorage";

// const API_BASE = ""; // Use Vite proxy

// const categories = [
//   "All",
//   "Chicken",
//   "Beef",
//   "Fish",
//   "Soup",
//   "Dessert",
//   "Drink",
// ];

// const initialMenuItems = [
//   {
//     id: 1,
//     pic: "https://placehold.co/80x80/f97316/white?text=Menu",
//     name: "Beef Burger",
//     category: "Beef",
//     price: 250,
//     details: "Delicious beef burger with cheese",
//     calories: 500,
//     available: true,
//   },
//   {
//     id: 2,
//     pic: "https://placehold.co/80x80/f97316/white?text=Menu",
//     name: "Chicken Fry",
//     category: "Chicken",
//     price: 300,
//     details: "Spicy crispy chicken fry",
//     calories: 600,
//     available: true,
//   },
//   {
//     id: 3,
//     pic: "https://placehold.co/80x80/f97316/white?text=Menu",
//     name: "Fish Curry",
//     category: "Fish",
//     price: 350,
//     details: "Traditional fish curry",
//     calories: 450,
//     available: false,
//   },
// ];

// export default function ManageMenuPage() {
//   const [menuItems, setMenuItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [editingItem, setEditingItem] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [formData, setFormData] = useState({
//     pic: "",
//     name: "",
//     category: "",
//     price: "",
//     details: "",
//     calories: "",
//     available: true,
//   });
//   const [navOpen, setNavOpen] = useState(false);
//   const [imageFile, setImageFile] = useState(null);
//   const [uploading, setUploading] = useState(false);

//   const sidebarWidth = navOpen ? 240 : 64;

//   // Load menu items from backend
//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         setErr("");

//         const q = searchTerm ? encodeURIComponent(searchTerm) : "";
//         const cat =
//           selectedCategory !== "All"
//             ? encodeURIComponent(selectedCategory)
//             : "";

//         const url = `${API_BASE}/api/menu-items?search=${q}&category=${cat}`;
//         const res = await fetch(url);
//         const data = await res.json();
//         setMenuItems(Array.isArray(data) ? data : []);
//       } catch (e) {
//         setErr(e?.message || "Failed to load menu items");
//         setMenuItems([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const t = setTimeout(load, 250);
//     return () => clearTimeout(t);
//   }, [searchTerm, selectedCategory]);

//   const filteredItems = menuItems.filter((item) =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const allowedTypes = [
//         "image/jpeg",
//         "image/jpg",
//         "image/png",
//         "image/gif",
//         "image/webp",
//       ];
//       if (!allowedTypes.includes(file.type)) {
//         alert("Only JPEG, PNG, GIF, and WebP images are allowed");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         alert("File size must be less than 5MB");
//         return;
//       }
//       setImageFile(file);
//     }
//   };

//   const uploadImage = async () => {
//     if (!imageFile) return null;

//     try {
//       setUploading(true);
//       const token = getToken();
//       if (!token) {
//         alert("Token not found. Please login.");
//         return null;
//       }

//       const formData = new FormData();
//       formData.append("image", imageFile);
//       formData.append("name", imageFile.name.split(".")[0]);

//       const res = await fetch(`${API_BASE}/api/upload/image`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Upload failed");

//       return data.url;
//     } catch (e) {
//       alert(`Image upload failed: ${e.message}`);
//       return null;
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleEdit = (item) => {
//     setEditingItem(item._id);
//     setFormData({
//       pic: item.imageUrl || item.pic || "",
//       name: item.name || "",
//       category: item.category || "",
//       price: item.price || "",
//       details: item.details || "",
//       calories: item.calories || "",
//       available:
//         item.isAvailable !== undefined
//           ? item.isAvailable
//           : item.available !== undefined
//             ? item.available
//             : true,
//     });
//     setImageFile(null);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this menu item?")) return;

//     try {
//       setErr("");
//       const token = getToken();
//       if (!token) {
//         alert("Token not found. Please login.");
//         return;
//       }

//       const res = await fetch(`${API_BASE}/api/menu-items/${id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(data?.message || "Delete failed");

//       setMenuItems((prev) =>
//         prev.filter((item) => String(item._id) !== String(id)),
//       );
//       if (String(editingItem) === String(id)) handleCancel();
//       alert("Menu item deleted!");
//     } catch (e) {
//       setErr(e?.message || "Failed to delete");
//     }
//   };

//   const handleCancel = () => {
//     setEditingItem(null);
//     setFormData({
//       pic: "",
//       name: "",
//       category: "",
//       price: "",
//       details: "",
//       calories: "",
//       available: true,
//     });
//     setImageFile(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setErr("");

//       const token = getToken();
//       if (!token) {
//         alert("Token not found. Please login as admin/staff.");
//         return;
//       }

//       // Upload image if file is selected
//       let imageUrl = formData.pic;
//       if (imageFile) {
//         const uploadedUrl = await uploadImage();
//         if (uploadedUrl) {
//           imageUrl = uploadedUrl;
//         } else {
//           alert("Image upload failed. Continuing with URL...");
//         }
//       }

//       const payload = {
//         name: String(formData.name || "").trim(),
//         category: String(formData.category || "").trim(),
//         imageUrl: String(imageUrl || "").trim(),
//         price: Number(formData.price || 0),
//         details: String(formData.details || "").trim(),
//         calories: Number(formData.calories || 0),
//         isAvailable: Boolean(formData.available),
//       };

//       const isEdit = Boolean(editingItem);
//       const url = isEdit
//         ? `${API_BASE}/api/menu-items/${editingItem}`
//         : `${API_BASE}/api/menu-items`;

//       const res = await fetch(url, {
//         method: isEdit ? "PUT" : "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok) {
//         throw new Error(data?.message || "Request failed");
//       }

//       if (isEdit) {
//         setMenuItems((prev) =>
//           prev.map((item) =>
//             String(item._id) === String(editingItem)
//               ? data?.item || item
//               : item,
//           ),
//         );
//         alert("Menu item updated!");
//       } else {
//         const created = data?.item;
//         if (created) setMenuItems((prev) => [created, ...prev]);
//         alert("Menu item added!");
//       }

//       handleCancel();
//     } catch (e) {
//       setErr(e?.message || "Failed to submit");
//     }
//   };

//   return (
//     <div className="flex bg-white min-h-screen overflow-hidden">
//       <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />

//       <main
//         className={`flex-1 transition-all duration-300 ease-in-out px-4 sm:px-6 py-6 w-full`}
//         style={{ marginLeft: navOpen ? 240 : 64 }}
//       >
//         <div className="max-w-7xl mx-auto w-full">
//           <h1 className="text-3xl font-bold mb-4 text-orange-600 mt-10 md:mt-0">
//             Manage Menu
//           </h1>

//           {err ? (
//             <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
//               {err}
//             </div>
//           ) : null}

//           {/* Category Filter */}
//           <div className="flex flex-wrap gap-2 mb-6">
//             {categories.map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setSelectedCategory(cat)}
//                 className={`px-4 py-1 rounded-full border text-sm font-medium ${
//                   selectedCategory === cat
//                     ? "bg-orange-500 text-white"
//                     : "bg-white text-gray-700 border-orange-400"
//                 } hover:bg-orange-100`}
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>

//           {/* Search Bar */}
//           <div className="mb-6 max-w-md">
//             <input
//               type="text"
//               placeholder="Search menu items..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
//             />
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto shadow-md rounded-lg mb-10">
//             <table className="min-w-full text-sm text-left text-gray-600">
//               <thead className="bg-orange-100 text-xs uppercase text-orange-700">
//                 <tr>
//                   <th className="px-6 py-3">Pic</th>
//                   <th className="px-6 py-3">Name</th>
//                   <th className="px-6 py-3">Category</th>
//                   <th className="px-6 py-3">Price</th>
//                   <th className="px-6 py-3">Details</th>
//                   <th className="px-6 py-3">Calories</th>
//                   <th className="px-6 py-3">Available</th>
//                   <th className="px-6 py-3 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {loading ? (
//                   <tr>
//                     <td
//                       colSpan="8"
//                       className="px-6 py-6 text-center text-gray-600"
//                     >
//                       Loading...
//                     </td>
//                   </tr>
//                 ) : (
//                   <>
//                     {filteredItems.map((item) => (
//                       <tr key={item._id} className="hover:bg-orange-50">
//                         <td className="px-6 py-4">
//                           <img
//                             src={
//                               item.imageUrl ||
//                               item.pic ||
//                               "https://placehold.co/80x80/f97316/white?text=Menu"
//                             }
//                             alt={item.name}
//                             className="h-12 w-12 rounded object-cover"
//                             onError={(e) =>
//                               (e.currentTarget.src =
//                                 "https://placehold.co/80x80/f97316/white?text=Menu")
//                             }
//                           />
//                         </td>
//                         <td className="px-6 py-4">{item.name}</td>
//                         <td className="px-6 py-4">{item.category}</td>
//                         <td className="px-6 py-4">৳{item.price}</td>
//                         <td className="px-6 py-4">{item.details}</td>
//                         <td className="px-6 py-4">{item.calories}</td>
//                         <td className="px-6 py-4">
//                           {item.isAvailable || item.available ? (
//                             <span className="text-green-600 font-semibold">
//                               Yes
//                             </span>
//                           ) : (
//                             <span className="text-red-600 font-semibold">
//                               No
//                             </span>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 text-right space-x-2">
//                           <button
//                             onClick={() => handleEdit(item)}
//                             className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => handleDelete(item._id)}
//                             className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
//                           >
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))}

//                     {!filteredItems.length && (
//                       <tr>
//                         <td
//                           colSpan="8"
//                           className="px-6 py-4 text-center text-gray-500"
//                         >
//                           No menu items found.
//                         </td>
//                       </tr>
//                     )}
//                   </>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Form */}
//           <div className="bg-white shadow-lg p-6 rounded-md">
//             <h2 className="text-xl font-semibold mb-4 text-orange-600">
//               {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
//             </h2>
//             <form
//               onSubmit={handleSubmit}
//               className="grid grid-cols-1 md:grid-cols-2 gap-6"
//             >
//               <input
//                 name="name"
//                 type="text"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Name"
//                 className="border rounded px-3 py-2"
//                 required
//               />

//               <div className="flex flex-col">
//                 <label className="text-sm font-semibold mb-1">
//                   Upload Image (or use URL below)
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                   onChange={handleImageChange}
//                   className="border px-3 py-2 rounded"
//                 />
//                 {imageFile && (
//                   <span className="text-xs text-green-600 mt-1">
//                     Selected: {imageFile.name}
//                   </span>
//                 )}
//               </div>

//               <input
//                 name="pic"
//                 type="url"
//                 value={formData.pic}
//                 onChange={handleChange}
//                 placeholder="Or paste Image URL"
//                 className="border rounded px-3 py-2"
//               />
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 className="border rounded px-3 py-2"
//                 required
//               >
//                 <option value="">Select Category</option>
//                 {categories.slice(1).map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
//               </select>
//               <input
//                 name="price"
//                 type="number"
//                 value={formData.price}
//                 onChange={handleChange}
//                 placeholder="Price"
//                 className="border rounded px-3 py-2"
//                 required
//               />
//               <input
//                 name="calories"
//                 type="number"
//                 value={formData.calories}
//                 onChange={handleChange}
//                 placeholder="Calories"
//                 className="border rounded px-3 py-2"
//               />
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   name="available"
//                   checked={formData.available}
//                   onChange={handleChange}
//                 />
//                 <label className="text-sm">Available</label>
//               </div>
//               <div className="md:col-span-2">
//                 <textarea
//                   name="details"
//                   value={formData.details}
//                   onChange={handleChange}
//                   placeholder="Details"
//                   className="w-full border rounded px-3 py-2"
//                   rows={3}
//                 />
//               </div>
//               <div className="md:col-span-2 flex gap-3">
//                 <button
//                   type="submit"
//                   disabled={uploading}
//                   className={`${uploading ? "bg-gray-400" : "bg-orange-500"} text-white px-4 py-2 rounded hover:bg-orange-600`}
//                 >
//                   {uploading
//                     ? "Uploading..."
//                     : editingItem
//                       ? "Update Item"
//                       : "Add Item"}
//                 </button>
//                 {editingItem && (
//                   <button
//                     type="button"
//                     onClick={handleCancel}
//                     disabled={uploading}
//                     className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
//                   >
//                     Cancel
//                   </button>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//         <AdminFooter />
//       </main>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import AdminFooter from "../components/AdminFooter";
import AdminNavbar from "../components/AdminNavbar";
import { getToken } from "../utils/authStorage";

const API_BASE = "";

const categories = [
  "All",
  "Chicken",
  "Beef",
  "Fish",
  "Soup",
  "Dessert",
  "Drink",
];

export default function ManageMenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [formData, setFormData] = useState({
    pic: "",
    name: "",
    category: "",
    price: "",
    details: "",
    calories: "",
    available: true,
  });
  const [navOpen, setNavOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const sidebarWidth = navOpen ? 240 : 64;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const q = searchTerm ? encodeURIComponent(searchTerm) : "";
        const cat =
          selectedCategory !== "All"
            ? encodeURIComponent(selectedCategory)
            : "";

        const url = `${API_BASE}/api/menu-items?search=${q}&category=${cat}`;
        const res = await fetch(url);
        const data = await res.json();
        setMenuItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Failed to load menu items");
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [searchTerm, selectedCategory]);

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, PNG, GIF, and WebP images are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setImageFile(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setUploading(true);
      const token = getToken();
      if (!token) {
        alert("Token not found. Please login.");
        return null;
      }

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("name", imageFile.name.split(".")[0]);

      const res = await fetch(`${API_BASE}/api/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");

      return data.url;
    } catch (e) {
      alert(`Image upload failed: ${e.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item._id);
    setFormData({
      pic: item.imageUrl || item.pic || "",
      name: item.name || "",
      category: item.category || "",
      price: item.price || "",
      details: item.details || "",
      calories: item.calories || "",
      available:
        item.isAvailable !== undefined
          ? item.isAvailable
          : item.available !== undefined
            ? item.available
            : true,
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;

    try {
      setErr("");
      const token = getToken();
      if (!token) {
        alert("Token not found. Please login.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/menu-items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      setMenuItems((prev) =>
        prev.filter((item) => String(item._id) !== String(id)),
      );
      if (String(editingItem) === String(id)) handleCancel();
      alert("Menu item deleted!");
    } catch (e) {
      setErr(e?.message || "Failed to delete");
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({
      pic: "",
      name: "",
      category: "",
      price: "",
      details: "",
      calories: "",
      available: true,
    });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErr("");

      const token = getToken();
      if (!token) {
        alert("Token not found. Please login as admin/staff.");
        return;
      }

      let imageUrl = formData.pic;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          alert("Image upload failed. Continuing with URL...");
        }
      }

      const payload = {
        name: String(formData.name || "").trim(),
        category: String(formData.category || "").trim(),
        imageUrl: String(imageUrl || "").trim(),
        price: Number(formData.price || 0),
        details: String(formData.details || "").trim(),
        calories: Number(formData.calories || 0),
        isAvailable: Boolean(formData.available),
      };

      const isEdit = Boolean(editingItem);
      const url = isEdit
        ? `${API_BASE}/api/menu-items/${editingItem}`
        : `${API_BASE}/api/menu-items`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Request failed");
      }

      if (isEdit) {
        setMenuItems((prev) =>
          prev.map((item) =>
            String(item._id) === String(editingItem)
              ? data?.item || item
              : item,
          ),
        );
        alert("Menu item updated!");
      } else {
        const created = data?.item;
        if (created) setMenuItems((prev) => [created, ...prev]);
        alert("Menu item added!");
      }

      handleCancel();
    } catch (e) {
      setErr(e?.message || "Failed to submit");
    }
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-50 via-orange-50 to-orange-100 min-h-screen overflow-hidden">
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>

      <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />

      <main
        className={`flex-1 transition-all duration-300 ease-in-out px-4 sm:px-6 py-6 w-full`}
        style={{ marginLeft: navOpen ? 240 : 64 }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-4 pb-4 border-b-4 border-gradient-to-r from-orange-400 to-orange-600">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent mt-10 md:mt-0">
                🍽️ Manage Menu
              </h1>
              <div className="flex-grow"></div>
              <div className="text-sm text-gray-600 font-medium hidden md:block">
                {filteredItems.length} items
              </div>
            </div>
          </div>

          {err && (
            <div className="mb-6 rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 text-red-700 shadow-lg animate-slide-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <span className="font-semibold">{err}</span>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-6 animate-slide-in">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`px-5 py-2 rounded-full border-2 text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg"
                    : "bg-white text-gray-700 border-orange-300 hover:border-orange-500 hover:bg-orange-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-8 max-w-2xl animate-fade-in-up">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 border-2 border-orange-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 shadow-md transition-all duration-300 bg-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden shadow-2xl rounded-2xl mb-10 border-2 border-orange-200 bg-white animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wide">Image</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wide">Name</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wide">Category</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wide">Price</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wide">Details</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wide">Calories</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wide">Status</th>
                    <th className="px-6 py-4 text-right font-bold uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
                          </div>
                          <p className="text-gray-600 font-semibold">Loading menu items...</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {filteredItems.map((item, idx) => (
                        <tr 
                          key={item._id} 
                          className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-300"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="relative group">
                              <img
                                src={
                                  item.imageUrl ||
                                  item.pic ||
                                  "https://placehold.co/80x80/f97316/white?text=Menu"
                                }
                                alt={item.name}
                                className="h-16 w-16 rounded-xl object-cover border-2 border-orange-200 shadow-md group-hover:scale-110 transition-transform duration-300"
                                onError={(e) =>
                                  (e.currentTarget.src =
                                    "https://placehold.co/80x80/f97316/white?text=Menu")
                                }
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-orange-600">৳{item.price}</td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{item.details}</td>
                          <td className="px-6 py-4 text-gray-600">{item.calories}</td>
                          <td className="px-6 py-4">
                            {item.isAvailable || item.available ? (
                              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center gap-1 w-fit">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Available
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1 w-fit">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Unavailable
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {!filteredItems.length && (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <span className="text-6xl opacity-50">🍽️</span>
                              <p className="text-gray-500 text-lg font-semibold">No menu items found</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow-2xl p-8 rounded-2xl border-2 border-orange-200 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                {editingItem ? "✏️ Edit Menu Item" : "➕ Add New Menu Item"}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Item Name *</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Upload Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-700 file:font-bold hover:file:bg-orange-100 transition-all duration-300"
                />
                {imageFile && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    ✅ Selected: {imageFile.name}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Or Image URL</label>
                <input
                  name="pic"
                  type="url"
                  value={formData.pic}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Price (৳) *</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Calories</label>
                <input
                  name="calories"
                  type="number"
                  value={formData.calories}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
                />
              </div>

              <div className="flex items-center space-x-3 pt-8">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-500"
                />
                <label className="text-sm font-bold text-gray-700">Available for Order</label>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700">Details</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Enter item details..."
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 resize-none"
                  rows={4}
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className={`${uploading ? "bg-gray-400" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"} text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:transform-none`}
                >
                  {uploading
                    ? "⏳ Uploading..."
                    : editingItem
                      ? "💾 Update Item"
                      : "➕ Add Item"}
                </button>
                {editingItem && (
                  <button
                    onClick={handleCancel}
                    disabled={uploading}
                    className="bg-gray-300 text-gray-800 px-8 py-4 rounded-xl font-bold hover:bg-gray-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    ❌ Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <AdminFooter />
      </main>
    </div>
  );
}