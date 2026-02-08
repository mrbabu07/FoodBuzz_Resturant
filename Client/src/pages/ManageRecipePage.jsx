// // // path: src/pages/ManageRecipePage.jsx
// // import React, { useEffect, useMemo, useState } from "react";
// // import AdminFooter from "../components/AdminFooter";
// // import AdminNavbar from "../components/AdminNavbar";
// // import { getToken } from "../utils/authStorage";

// // const API_BASE = ""; // Use Vite proxy

// // // ✅ Fixed categories
// // const CATEGORIES = [
// //   "All",
// //   "Chicken",
// //   "Beef",
// //   "Fish",
// //   "Soup",
// //   "Dessert",
// //   "Drink",
// // ];

// // function normalize(str = "") {
// //   return String(str).toLowerCase().trim();
// // }

// // export default function ManageRecipePage() {
// //   const [recipes, setRecipes] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [err, setErr] = useState("");

// //   const [navOpen, setNavOpen] = useState(false);
// //   const [mobileNavOpen, setMobileNavOpen] = useState(false);

// //   const [search, setSearch] = useState("");
// //   const [filterCategory, setFilterCategory] = useState("All");

// //   const [modalOpen, setModalOpen] = useState(false);
// //   const [selectedRecipe, setSelectedRecipe] = useState(null);

// //   const [editId, setEditId] = useState(null);

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     pic: "",
// //     category: "",
// //     description: "",
// //     prepTime: "",
// //     cookingTime: "",
// //     servings: "",
// //     calories: "",
// //     ingredients: [""],
// //     tools: [""],
// //     instructions: [""],
// //     nutrition: "",
// //   });

// //   const [imageFile, setImageFile] = useState(null);
// //   const [uploading, setUploading] = useState(false);

// //   const sidebarWidthDesktop = navOpen ? 240 : 64;

// //   // ✅ Load recipes from backend with server-side filter support
// //   useEffect(() => {
// //     const load = async () => {
// //       try {
// //         setLoading(true);
// //         setErr("");

// //         const q = search ? encodeURIComponent(search) : "";
// //         const cat = filterCategory ? encodeURIComponent(filterCategory) : "All";

// //         // Backend supports: /api/recipes?q=&category=
// //         const url = `${API_BASE}/api/recipes?q=${q}&category=${cat}`;

// //         const res = await fetch(url);
// //         const data = await res.json();
// //         setRecipes(Array.isArray(data) ? data : []);
// //       } catch (e) {
// //         setErr(e?.message || "Failed to load recipes");
// //         setRecipes([]);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     // ছোট debounce feel
// //     const t = setTimeout(load, 250);
// //     return () => clearTimeout(t);
// //   }, [search, filterCategory]);

// //   // ✅ local filter as backup (if needed)
// //   const filteredRecipes = useMemo(() => {
// //     const q = normalize(search);
// //     return (recipes || []).filter((r) => {
// //       const okCat =
// //         filterCategory === "All" ||
// //         String(r?.category) === String(filterCategory);
// //       const okText = !q || normalize(r?.name).includes(q);
// //       return okCat && okText;
// //     });
// //   }, [recipes, search, filterCategory]);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((p) => ({ ...p, [name]: value }));
// //   };

// //   const handleImageChange = (e) => {
// //     const file = e.target.files?.[0];
// //     if (file) {
// //       // Validate file type
// //       const allowedTypes = [
// //         "image/jpeg",
// //         "image/jpg",
// //         "image/png",
// //         "image/gif",
// //         "image/webp",
// //       ];
// //       if (!allowedTypes.includes(file.type)) {
// //         alert("Only JPEG, PNG, GIF, and WebP images are allowed");
// //         return;
// //       }
// //       // Validate file size (5MB max)
// //       if (file.size > 5 * 1024 * 1024) {
// //         alert("File size must be less than 5MB");
// //         return;
// //       }
// //       setImageFile(file);
// //     }
// //   };

// //   const uploadImage = async () => {
// //     if (!imageFile) return null;

// //     try {
// //       setUploading(true);
// //       const token = getToken();
// //       if (!token) {
// //         alert("Token not found. Please login.");
// //         return null;
// //       }

// //       const formData = new FormData();
// //       formData.append("image", imageFile);
// //       formData.append("name", imageFile.name.split(".")[0]);

// //       const res = await fetch(`${API_BASE}/api/upload/image`, {
// //         method: "POST",
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: formData,
// //       });

// //       const data = await res.json();
// //       if (!res.ok) throw new Error(data?.message || "Upload failed");

// //       return data.url;
// //     } catch (e) {
// //       alert(`Image upload failed: ${e.message}`);
// //       return null;
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   const handleArrayChange = (key, index, value) => {
// //     const updated = [...(formData[key] || [])];
// //     updated[index] = value;
// //     setFormData((p) => ({ ...p, [key]: updated }));
// //   };

// //   const addField = (key) => {
// //     setFormData((p) => ({ ...p, [key]: [...(p[key] || []), ""] }));
// //   };

// //   const removeField = (key, index) => {
// //     const updated = [...(formData[key] || [])];
// //     updated.splice(index, 1);
// //     setFormData((p) => ({ ...p, [key]: updated.length ? updated : [""] }));
// //   };

// //   const resetForm = () => {
// //     setFormData({
// //       name: "",
// //       pic: "",
// //       category: "",
// //       description: "",
// //       prepTime: "",
// //       cookingTime: "",
// //       servings: "",
// //       calories: "",
// //       ingredients: [""],
// //       tools: [""],
// //       instructions: [""],
// //       nutrition: "",
// //     });
// //     setEditId(null);
// //     setImageFile(null);
// //   };

// //   const openModal = (recipe) => {
// //     setSelectedRecipe(recipe);
// //     setModalOpen(true);
// //     document.body.style.overflow = "hidden";
// //   };

// //   const closeModal = () => {
// //     setModalOpen(false);
// //     setSelectedRecipe(null);
// //     document.body.style.overflow = "auto";
// //   };

// //   const handleEdit = (recipe) => {
// //     setEditId(recipe?._id);
// //     setFormData({
// //       name: recipe?.name || "",
// //       pic: recipe?.imageUrl || recipe?.pic || "",
// //       category: recipe?.category || "",
// //       description: recipe?.description || "",
// //       prepTime: recipe?.prepTime ?? "",
// //       cookingTime: recipe?.cookingTime ?? "",
// //       servings: recipe?.servings ?? "",
// //       calories: recipe?.calories ?? "",
// //       ingredients:
// //         Array.isArray(recipe?.ingredients) && recipe.ingredients.length
// //           ? recipe.ingredients
// //           : [""],
// //       tools:
// //         Array.isArray(recipe?.tools) && recipe.tools.length
// //           ? recipe.tools
// //           : [""],
// //       instructions:
// //         Array.isArray(recipe?.instructions) && recipe.instructions.length
// //           ? recipe.instructions
// //           : [""],
// //       nutrition: recipe?.nutrition || "",
// //     });
// //     window.scrollTo({ top: 0, behavior: "smooth" });
// //   };

// //   // ✅ CREATE / UPDATE (backend)
// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     try {
// //       setErr("");

// //       const token = getToken();
// //       if (!token) {
// //         alert("Token not found. Please login as admin/staff.");
// //         return;
// //       }

// //       // Upload image if file is selected
// //       let imageUrl = formData.pic;
// //       if (imageFile) {
// //         const uploadedUrl = await uploadImage();
// //         if (uploadedUrl) {
// //           imageUrl = uploadedUrl;
// //         } else {
// //           alert("Image upload failed. Continuing with URL...");
// //         }
// //       }

// //       const payload = {
// //         name: String(formData.name || "").trim(),
// //         category: String(formData.category || "").trim(),
// //         description: String(formData.description || "").trim(),
// //         pic: String(imageUrl || "").trim(), // backend supports pic -> imageUrl
// //         prepTime: Number(formData.prepTime || 0),
// //         cookingTime: Number(formData.cookingTime || 0),
// //         servings: Number(formData.servings || 1),
// //         calories: Number(formData.calories || 0),
// //         ingredients: (formData.ingredients || [])
// //           .map((x) => String(x || "").trim())
// //           .filter(Boolean),
// //         tools: (formData.tools || [])
// //           .map((x) => String(x || "").trim())
// //           .filter(Boolean),
// //         instructions: (formData.instructions || [])
// //           .map((x) => String(x || "").trim())
// //           .filter(Boolean),
// //         nutrition: String(formData.nutrition || "").trim(),
// //       };

// //       const isEdit = Boolean(editId);
// //       const url = isEdit
// //         ? `${API_BASE}/api/recipes/${editId}`
// //         : `${API_BASE}/api/recipes`;

// //       const res = await fetch(url, {
// //         method: isEdit ? "PUT" : "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify(payload),
// //       });

// //       const data = await res.json().catch(() => ({}));

// //       if (!res.ok) {
// //         throw new Error(data?.message || "Request failed");
// //       }

// //       // reload list quickly
// //       if (isEdit) {
// //         setRecipes((prev) =>
// //           prev.map((r) =>
// //             String(r._id) === String(editId) ? data?.recipe || r : r,
// //           ),
// //         );
// //         alert("Recipe updated!");
// //       } else {
// //         const created = data?.recipe;
// //         if (created) setRecipes((prev) => [created, ...prev]);
// //         alert("Recipe added!");
// //       }

// //       resetForm();
// //     } catch (e) {
// //       setErr(e?.message || "Failed to submit");
// //     }
// //   };

// //   // ✅ DELETE (backend)
// //   const handleDelete = async (id) => {
// //     if (!window.confirm("Delete this recipe?")) return;

// //     try {
// //       setErr("");
// //       const token = getToken();
// //       if (!token) {
// //         alert("Token not found. Please login as admin.");
// //         return;
// //       }

// //       const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
// //         method: "DELETE",
// //         headers: { Authorization: `Bearer ${token}` },
// //       });

// //       const data = await res.json().catch(() => ({}));
// //       if (!res.ok) throw new Error(data?.message || "Delete failed");

// //       setRecipes((prev) => prev.filter((r) => String(r._id) !== String(id)));
// //       if (String(editId) === String(id)) resetForm();
// //     } catch (e) {
// //       setErr(e?.message || "Failed to delete");
// //     }
// //   };

// //   return (
// //     <div className="flex min-h-screen bg-white overflow-hidden">
// //       {/* Desktop Sidebar */}
// //       <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />

// //       {/* Mobile Sidebar Overlay */}
// //       {mobileNavOpen && (
// //         <div
// //           className="fixed inset-0 z-40 md:hidden bg-black bg-opacity-50"
// //           onClick={() => setMobileNavOpen(false)}
// //         />
// //       )}

// //       {/* Main content */}
// //       <main
// //         className="flex-1 transition-all duration-300 p-6 max-w-full overflow-auto"
// //         style={{ marginLeft: sidebarWidthDesktop }}
// //       >
// //         <h1 className="text-3xl font-bold mb-4 text-orange-600 mt-10 md:mt-0">
// //           Manage Recipes
// //         </h1>

// //         {err ? (
// //           <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
// //             {err}
// //           </div>
// //         ) : null}

// //         {/* Mini nav with categories */}
// //         <div className="flex flex-wrap gap-3 mb-6">
// //           {CATEGORIES.map((c) => (
// //             <button
// //               key={c}
// //               onClick={() => setFilterCategory(c)}
// //               className={`px-4 py-1 rounded-full border ${
// //                 filterCategory === c
// //                   ? "bg-orange-500 text-white"
// //                   : "bg-white text-orange-500 border-orange-400"
// //               } hover:bg-orange-100 transition`}
// //             >
// //               {c}
// //             </button>
// //           ))}
// //         </div>

// //         {/* Search bar */}
// //         <div className="mb-4 max-w-md">
// //           <input
// //             type="text"
// //             value={search}
// //             onChange={(e) => setSearch(e.target.value)}
// //             placeholder="Search by name..."
// //             className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
// //           />
// //         </div>

// //         {/* Table */}
// //         <div className="overflow-x-auto mb-10 border border-gray-300 rounded-md shadow">
// //           <table className="min-w-full text-sm divide-y divide-gray-200">
// //             <thead className="bg-orange-100">
// //               <tr>
// //                 <th className="px-6 py-3 text-left">Image</th>
// //                 <th className="px-6 py-3 text-left">Name</th>
// //                 <th className="px-6 py-3 text-left">Category</th>
// //                 <th className="px-6 py-3 text-left">Actions</th>
// //               </tr>
// //             </thead>

// //             <tbody className="bg-white divide-y divide-gray-100">
// //               {loading ? (
// //                 <tr>
// //                   <td
// //                     colSpan="4"
// //                     className="px-6 py-6 text-center text-gray-600"
// //                   >
// //                     Loading...
// //                   </td>
// //                 </tr>
// //               ) : (
// //                 <>
// //                   {filteredRecipes.map((r) => (
// //                     <tr key={r._id}>
// //                       <td className="px-6 py-4">
// //                         <img
// //                           src={
// //                             r.imageUrl ||
// //                             r.pic ||
// //                             "https://placehold.co/80x80/f97316/white?text=Recipe"
// //                           }
// //                           alt={r.name}
// //                           className="h-12 w-12 object-cover rounded"
// //                           onError={(e) =>
// //                             (e.currentTarget.src =
// //                               "https://via.placeholder.com/80")
// //                           }
// //                         />
// //                       </td>
// //                       <td className="px-6 py-4">{r.name}</td>
// //                       <td className="px-6 py-4">{r.category}</td>
// //                       <td className="px-6 py-4 space-x-2">
// //                         <button
// //                           onClick={() => openModal(r)}
// //                           className="px-3 py-1 bg-orange-500 text-white rounded"
// //                         >
// //                           Details
// //                         </button>
// //                         <button
// //                           onClick={() => handleEdit(r)}
// //                           className="px-3 py-1 bg-blue-500 text-white rounded"
// //                         >
// //                           Edit
// //                         </button>
// //                         <button
// //                           onClick={() => handleDelete(r._id)}
// //                           className="px-3 py-1 bg-red-500 text-white rounded"
// //                         >
// //                           Delete
// //                         </button>
// //                       </td>
// //                     </tr>
// //                   ))}

// //                   {!filteredRecipes.length && (
// //                     <tr>
// //                       <td
// //                         colSpan="4"
// //                         className="px-6 py-4 text-center text-gray-500"
// //                       >
// //                         No recipe found.
// //                       </td>
// //                     </tr>
// //                   )}
// //                 </>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>

// //         {/* Form */}
// //         <h2 className="text-2xl font-bold mb-4 text-orange-600">
// //           {editId ? "Edit Recipe" : "Add New Recipe"}
// //         </h2>

// //         <form
// //           onSubmit={handleSubmit}
// //           className="grid grid-cols-1 md:grid-cols-2 gap-4"
// //           autoComplete="off"
// //         >
// //           <input
// //             name="name"
// //             placeholder="Name"
// //             value={formData.name}
// //             onChange={handleChange}
// //             required
// //             className="border px-3 py-2 rounded"
// //           />

// //           <div className="flex flex-col">
// //             <label className="text-sm font-semibold mb-1">
// //               Upload Image (or use URL below)
// //             </label>
// //             <input
// //               type="file"
// //               accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
// //               onChange={handleImageChange}
// //               className="border px-3 py-2 rounded"
// //             />
// //             {imageFile && (
// //               <span className="text-xs text-green-600 mt-1">
// //                 Selected: {imageFile.name}
// //               </span>
// //             )}
// //           </div>

// //           <input
// //             name="pic"
// //             placeholder="Or paste Image URL"
// //             value={formData.pic}
// //             onChange={handleChange}
// //             className="border px-3 py-2 rounded"
// //           />

// //           <select
// //             name="category"
// //             value={formData.category}
// //             onChange={handleChange}
// //             required
// //             className="border px-3 py-2 rounded"
// //           >
// //             <option value="">Select Category</option>
// //             {CATEGORIES.filter((c) => c !== "All").map((c) => (
// //               <option key={c} value={c}>
// //                 {c}
// //               </option>
// //             ))}
// //           </select>

// //           <input
// //             name="prepTime"
// //             type="number"
// //             placeholder="Prep Time"
// //             value={formData.prepTime}
// //             onChange={handleChange}
// //             min={0}
// //             className="border px-3 py-2 rounded"
// //           />

// //           <input
// //             name="cookingTime"
// //             type="number"
// //             placeholder="Cooking Time"
// //             value={formData.cookingTime}
// //             onChange={handleChange}
// //             min={0}
// //             className="border px-3 py-2 rounded"
// //           />

// //           <input
// //             name="servings"
// //             type="number"
// //             placeholder="Servings"
// //             value={formData.servings}
// //             onChange={handleChange}
// //             min={1}
// //             className="border px-3 py-2 rounded"
// //           />

// //           <input
// //             name="calories"
// //             type="number"
// //             placeholder="Calories"
// //             value={formData.calories}
// //             onChange={handleChange}
// //             min={0}
// //             className="border px-3 py-2 rounded"
// //           />

// //           <textarea
// //             name="description"
// //             placeholder="Short Description"
// //             value={formData.description}
// //             onChange={handleChange}
// //             rows="3"
// //             className="md:col-span-2 border px-3 py-2 rounded resize-none"
// //           />

// //           {/* Arrays */}
// //           {["ingredients", "tools", "instructions"].map((key) => (
// //             <div key={key} className="md:col-span-2">
// //               <label className="font-semibold capitalize">{key}</label>

// //               {(formData[key] || [""]).map((v, i) => (
// //                 <div key={i} className="flex gap-2 mt-2 items-center">
// //                   <input
// //                     value={v}
// //                     onChange={(e) => handleArrayChange(key, i, e.target.value)}
// //                     className="w-full border px-3 py-2 rounded"
// //                   />
// //                   <button
// //                     type="button"
// //                     onClick={() => removeField(key, i)}
// //                     className="text-red-500 text-2xl font-bold leading-none"
// //                     disabled={(formData[key] || []).length === 1}
// //                     title={
// //                       (formData[key] || []).length === 1
// //                         ? "At least one required"
// //                         : "Remove"
// //                     }
// //                   >
// //                     ×
// //                   </button>
// //                 </div>
// //               ))}

// //               <button
// //                 type="button"
// //                 onClick={() => addField(key)}
// //                 className="text-sm text-orange-500 mt-1 hover:underline"
// //               >
// //                 + Add {key.slice(0, -1)}
// //               </button>
// //             </div>
// //           ))}

// //           <textarea
// //             name="nutrition"
// //             placeholder="Nutrition (optional)"
// //             value={formData.nutrition}
// //             onChange={handleChange}
// //             rows="2"
// //             className="md:col-span-2 border px-3 py-2 rounded resize-none"
// //           />

// //           <div className="md:col-span-2 flex gap-4">
// //             <button
// //               type="submit"
// //               disabled={uploading}
// //               className={`px-4 py-2 ${uploading ? "bg-gray-400" : "bg-orange-500"} text-white rounded hover:bg-orange-600 transition`}
// //             >
// //               {uploading ? "Uploading..." : editId ? "Update" : "Submit"}
// //             </button>

// //             {editId && (
// //               <button
// //                 type="button"
// //                 onClick={resetForm}
// //                 disabled={uploading}
// //                 className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
// //               >
// //                 Cancel Edit
// //               </button>
// //             )}
// //           </div>
// //         </form>

// //         {/* Modal */}
// //         {modalOpen && selectedRecipe && (
// //           <div
// //             className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-80 px-4"
// //             onClick={closeModal}
// //           >
// //             <div
// //               className="bg-white max-w-3xl w-full p-6 rounded shadow-lg relative max-h-[90vh] overflow-y-auto"
// //               onClick={(e) => e.stopPropagation()}
// //             >
// //               <button
// //                 onClick={closeModal}
// //                 className="absolute top-3 right-4 text-3xl font-bold text-red-600"
// //                 aria-label="Close modal"
// //               >
// //                 ×
// //               </button>

// //               <h2 className="text-2xl font-bold text-orange-600 mb-2">
// //                 {selectedRecipe.name}
// //               </h2>

// //               <img
// //                 src={
// //                   selectedRecipe.imageUrl ||
// //                   selectedRecipe.pic ||
// //                   "https://placehold.co/600x300/f97316/white?text=Recipe"
// //                 }
// //                 alt={selectedRecipe.name}
// //                 className="w-full max-h-72 object-cover rounded mb-4"
// //               />

// //               <p className="text-gray-700 mb-4">
// //                 {selectedRecipe.description || "No description"}
// //               </p>

// //               <div className="grid grid-cols-2 gap-4 text-sm mb-4">
// //                 <div>
// //                   <b>Prep Time:</b> {selectedRecipe.prepTime ?? 0} min
// //                 </div>
// //                 <div>
// //                   <b>Cook Time:</b> {selectedRecipe.cookingTime ?? 0} min
// //                 </div>
// //                 <div>
// //                   <b>Servings:</b> {selectedRecipe.servings ?? 1}
// //                 </div>
// //                 <div>
// //                   <b>Calories:</b> {selectedRecipe.calories ?? 0}
// //                 </div>
// //               </div>

// //               <div className="mb-3">
// //                 <h3 className="font-semibold">Ingredients:</h3>
// //                 <ul className="list-disc pl-5 text-sm text-gray-800">
// //                   {(selectedRecipe.ingredients || []).map((i, idx) => (
// //                     <li key={idx}>{i}</li>
// //                   ))}
// //                 </ul>
// //               </div>

// //               <div className="mb-3">
// //                 <h3 className="font-semibold">Tools:</h3>
// //                 <ul className="list-disc pl-5 text-sm text-gray-800">
// //                   {(selectedRecipe.tools || []).map((t, idx) => (
// //                     <li key={idx}>{t}</li>
// //                   ))}
// //                 </ul>
// //               </div>

// //               <div>
// //                 <h3 className="font-semibold">Instructions:</h3>
// //                 <ol className="list-decimal pl-5 text-sm text-gray-800">
// //                   {(selectedRecipe.instructions || []).map((s, idx) => (
// //                     <li key={idx}>{s}</li>
// //                   ))}
// //                 </ol>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         <AdminFooter />
// //       </main>
// //     </div>
// //   );
// // }

// import React, { useEffect, useMemo, useState } from "react";
// import AdminFooter from "../components/AdminFooter";
// import AdminNavbar from "../components/AdminNavbar";
// import { getToken } from "../utils/authStorage";
// import BulkRecipeUpload from "../components/BulkRecipeUpload";

// const API_BASE = "";

// const CATEGORIES = [
//   "All",
//   "Chicken",
//   "Beef",
//   "Fish",
//   "Soup",
//   "Dessert",
//   "Drink",
// ];

// function normalize(str = "") {
//   return String(str).toLowerCase().trim();
// }

// export default function ManageRecipePage() {
//   const [recipes, setRecipes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [navOpen, setNavOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedRecipe, setSelectedRecipe] = useState(null);
//   const [editId, setEditId] = useState(null);
//   const [showBulkUpload, setShowBulkUpload] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     pic: "",
//     category: "",
//     description: "",
//     prepTime: "",
//     cookingTime: "",
//     servings: "",
//     calories: "",
//     ingredients: [""],
//     tools: [""],
//     instructions: [""],
//     nutrition: "",
//   });
//   const [imageFile, setImageFile] = useState(null);
//   const [uploading, setUploading] = useState(false);

//   const sidebarWidthDesktop = navOpen ? 240 : 64;

//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         setErr("");

//         const q = search ? encodeURIComponent(search) : "";
//         const cat = filterCategory ? encodeURIComponent(filterCategory) : "All";

//         const url = `${API_BASE}/api/recipes?q=${q}&category=${cat}`;

//         const res = await fetch(url);
//         const data = await res.json();
//         setRecipes(Array.isArray(data) ? data : []);
//       } catch (e) {
//         setErr(e?.message || "Failed to load recipes");
//         setRecipes([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const t = setTimeout(load, 250);
//     return () => clearTimeout(t);
//   }, [search, filterCategory]);

//   const filteredRecipes = useMemo(() => {
//     const q = normalize(search);
//     return (recipes || []).filter((r) => {
//       const okCat =
//         filterCategory === "All" ||
//         String(r?.category) === String(filterCategory);
//       const okText = !q || normalize(r?.name).includes(q);
//       return okCat && okText;
//     });
//   }, [recipes, search, filterCategory]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
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

//   const handleArrayChange = (key, index, value) => {
//     const updated = [...(formData[key] || [])];
//     updated[index] = value;
//     setFormData((p) => ({ ...p, [key]: updated }));
//   };

//   const addField = (key) => {
//     setFormData((p) => ({ ...p, [key]: [...(p[key] || []), ""] }));
//   };

//   const removeField = (key, index) => {
//     const updated = [...(formData[key] || [])];
//     updated.splice(index, 1);
//     setFormData((p) => ({ ...p, [key]: updated.length ? updated : [""] }));
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       pic: "",
//       category: "",
//       description: "",
//       prepTime: "",
//       cookingTime: "",
//       servings: "",
//       calories: "",
//       ingredients: [""],
//       tools: [""],
//       instructions: [""],
//       nutrition: "",
//     });
//     setEditId(null);
//     setImageFile(null);
//   };

//   const openModal = (recipe) => {
//     setSelectedRecipe(recipe);
//     setModalOpen(true);
//     document.body.style.overflow = "hidden";
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setSelectedRecipe(null);
//     document.body.style.overflow = "auto";
//   };

//   const handleEdit = (recipe) => {
//     setEditId(recipe?._id);
//     setFormData({
//       name: recipe?.name || "",
//       pic: recipe?.imageUrl || recipe?.pic || "",
//       category: recipe?.category || "",
//       description: recipe?.description || "",
//       prepTime: recipe?.prepTime ?? "",
//       cookingTime: recipe?.cookingTime ?? "",
//       servings: recipe?.servings ?? "",
//       calories: recipe?.calories ?? "",
//       ingredients:
//         Array.isArray(recipe?.ingredients) && recipe.ingredients.length
//           ? recipe.ingredients
//           : [""],
//       tools:
//         Array.isArray(recipe?.tools) && recipe.tools.length
//           ? recipe.tools
//           : [""],
//       instructions:
//         Array.isArray(recipe?.instructions) && recipe.instructions.length
//           ? recipe.instructions
//           : [""],
//       nutrition: recipe?.nutrition || "",
//     });
//     window.scrollTo({ top: 0, behavior: "smooth" });
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
//         description: String(formData.description || "").trim(),
//         pic: String(imageUrl || "").trim(),
//         prepTime: Number(formData.prepTime || 0),
//         cookingTime: Number(formData.cookingTime || 0),
//         servings: Number(formData.servings || 1),
//         calories: Number(formData.calories || 0),
//         ingredients: (formData.ingredients || [])
//           .map((x) => String(x || "").trim())
//           .filter(Boolean),
//         tools: (formData.tools || [])
//           .map((x) => String(x || "").trim())
//           .filter(Boolean),
//         instructions: (formData.instructions || [])
//           .map((x) => String(x || "").trim())
//           .filter(Boolean),
//         nutrition: String(formData.nutrition || "").trim(),
//       };

//       const isEdit = Boolean(editId);
//       const url = isEdit
//         ? `${API_BASE}/api/recipes/${editId}`
//         : `${API_BASE}/api/recipes`;

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
//         setRecipes((prev) =>
//           prev.map((r) =>
//             String(r._id) === String(editId) ? data?.recipe || r : r,
//           ),
//         );
//         alert("Recipe updated!");
//       } else {
//         const created = data?.recipe;
//         if (created) setRecipes((prev) => [created, ...prev]);
//         alert("Recipe added!");
//       }

//       resetForm();
//     } catch (e) {
//       setErr(e?.message || "Failed to submit");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this recipe?")) return;

//     try {
//       setErr("");
//       const token = getToken();
//       if (!token) {
//         alert("Token not found. Please login as admin.");
//         return;
//       }

//       const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(data?.message || "Delete failed");

//       setRecipes((prev) => prev.filter((r) => String(r._id) !== String(id)));
//       if (String(editId) === String(id)) resetForm();
//     } catch (e) {
//       setErr(e?.message || "Failed to delete");
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-orange-100 overflow-hidden">
//       <style>{`
//         @keyframes fade-in {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fade-in 0.6s ease-out;
//         }
//       `}</style>

//       <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />

//       <main
//         className="flex-1 transition-all duration-300 p-6 max-w-full overflow-auto"
//         style={{ marginLeft: sidebarWidthDesktop }}
//       >
//         <div className="mb-8 animate-fade-in">
//           <div className="flex items-center gap-4 pb-4 border-b-4 border-gradient-to-r from-orange-400 to-orange-600">
//             <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent mt-10 md:mt-0">
//               📖 Manage Recipes
//             </h1>
//             <div className="flex-grow"></div>

//             {/* Bulk Upload Button */}
//             <button
//               onClick={() => setShowBulkUpload(!showBulkUpload)}
//               className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transform hover:scale-105 transition-all"
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                 />
//               </svg>
//               <span className="hidden md:inline">Bulk Upload</span>
//             </button>

//             <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-orange-200">
//               <span className="text-sm font-bold text-gray-600">Total:</span>
//               <span className="text-lg font-extrabold text-orange-600">
//                 {filteredRecipes.length}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Bulk Upload Component */}
//         {showBulkUpload && (
//           <div className="mb-6 animate-fade-in">
//             <BulkRecipeUpload
//               onSuccess={() => {
//                 fetchRecipes();
//                 setShowBulkUpload(false);
//               }}
//             />
//           </div>
//         )}

//         {err && (
//           <div className="mb-6 rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 text-red-700 shadow-lg animate-fade-in">
//             <div className="flex items-center gap-3">
//               <span className="text-2xl">⚠️</span>
//               <span className="font-semibold">{err}</span>
//             </div>
//           </div>
//         )}

//         {/* Category Filter */}
//         <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
//           {CATEGORIES.map((c, idx) => (
//             <button
//               key={c}
//               onClick={() => setFilterCategory(c)}
//               style={{ animationDelay: `${idx * 50}ms` }}
//               className={`px-5 py-2 rounded-full border-2 font-bold transition-all duration-300 transform hover:scale-105 ${
//                 filterCategory === c
//                   ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg"
//                   : "bg-white text-orange-500 border-orange-400 hover:bg-orange-50"
//               }`}
//             >
//               {c}
//             </button>
//           ))}
//         </div>

//         {/* Search bar */}
//         <div className="mb-8 max-w-2xl animate-fade-in">
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="🔍 Search recipes by name..."
//             className="w-full px-6 py-4 border-2 border-orange-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 shadow-md transition-all duration-300 bg-white font-medium"
//           />
//         </div>

//         {/* Table */}
//         <div className="overflow-hidden mb-10 border-2 border-orange-200 rounded-2xl shadow-2xl bg-white animate-fade-in">
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
//                 <tr>
//                   <th className="px-6 py-4 text-left font-extrabold uppercase tracking-wide">
//                     Image
//                   </th>
//                   <th className="px-6 py-4 text-left font-extrabold uppercase tracking-wide">
//                     Name
//                   </th>
//                   <th className="px-6 py-4 text-left font-extrabold uppercase tracking-wide">
//                     Category
//                   </th>
//                   <th className="px-6 py-4 text-left font-extrabold uppercase tracking-wide">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-orange-100">
//                 {loading ? (
//                   <tr>
//                     <td colSpan="4" className="px-6 py-12 text-center">
//                       <div className="flex flex-col items-center gap-4">
//                         <div className="relative w-16 h-16">
//                           <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-ping"></div>
//                           <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
//                         </div>
//                         <p className="text-gray-600 font-semibold">
//                           Loading recipes...
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   <>
//                     {filteredRecipes.map((r) => (
//                       <tr
//                         key={r._id}
//                         className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all duration-300"
//                       >
//                         <td className="px-6 py-4">
//                           <div className="group relative">
//                             <img
//                               src={
//                                 r.imageUrl ||
//                                 r.pic ||
//                                 "https://placehold.co/80x80/f97316/white?text=Recipe"
//                               }
//                               alt={r.name}
//                               className="h-16 w-16 object-cover rounded-xl border-2 border-orange-200 shadow-md group-hover:scale-110 transition-transform duration-300"
//                               onError={(e) =>
//                                 (e.currentTarget.src =
//                                   "https://via.placeholder.com/80")
//                               }
//                             />
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 font-bold text-gray-800">
//                           {r.name}
//                         </td>
//                         <td className="px-6 py-4">
//                           <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
//                             {r.category}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 space-x-2">
//                           <button
//                             onClick={() => openModal(r)}
//                             className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
//                           >
//                             👁️ Details
//                           </button>
//                           <button
//                             onClick={() => handleEdit(r)}
//                             className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
//                           >
//                             ✏️ Edit
//                           </button>
//                           <button
//                             onClick={() => handleDelete(r._id)}
//                             className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
//                           >
//                             🗑️ Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))}

//                     {!filteredRecipes.length && (
//                       <tr>
//                         <td colSpan="4" className="px-6 py-12 text-center">
//                           <div className="flex flex-col items-center gap-4">
//                             <span className="text-6xl opacity-50">📖</span>
//                             <p className="text-gray-500 text-lg font-semibold">
//                               No recipes found
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Form */}
//         <div className="bg-white shadow-2xl p-8 rounded-2xl border-2 border-orange-200 mb-10 animate-fade-in">
//           <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-200">
//             <h2 className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
//               {editId ? "✏️ Edit Recipe" : "➕ Add New Recipe"}
//             </h2>
//           </div>

//           <div
//             className="grid grid-cols-1 md:grid-cols-2 gap-6"
//             autoComplete="off"
//           >
//             {/* Basic fields */}
//             <div className="space-y-2">
//               <label className="text-sm font-bold text-gray-700">
//                 Recipe Name *
//               </label>
//               <input
//                 name="name"
//                 placeholder="Enter recipe name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-bold text-gray-700">
//                 Upload Image
//               </label>
//               <input
//                 type="file"
//                 accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                 onChange={handleImageChange}
//                 className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-700 file:font-bold hover:file:bg-orange-100"
//               />
//               {imageFile && (
//                 <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
//                   ✅ Selected: {imageFile.name}
//                 </span>
//               )}
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-bold text-gray-700">
//                 Or Image URL
//               </label>
//               <input
//                 name="pic"
//                 placeholder="https://example.com/image.jpg"
//                 value={formData.pic}
//                 onChange={handleChange}
//                 className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-bold text-gray-700">
//                 Category *
//               </label>
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 required
//                 className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
//               >
//                 <option value="">Select Category</option>
//                 {CATEGORIES.filter((c) => c !== "All").map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Time and serving fields in grid */}
//             <div className="space-y-2">
//               <label className="text-sm font-bold text-gray-700">
//                 Prep Time (min)
//               </label>
//               <input
//                 name="prepTime"
//                 type="number"
//                 placeholder="0"
//                 value={formData.prepTime}
//                 onChange={handleChange}
//                 min={0}
//                 className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-bold text-gray-700">
//                 Cooking Time (min)
//               </label>
//               <input
//                 name="cookingTime"
//                 type="number"
//                 placeholder="0"
//                 value={formData.cookingTime}
//                 onChange={handleChange}
//                 min={0}
//                 className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-bold text-gray-700">
//                 Servings
//               </label>
//               <input
//                 name="servings"
//                 type="number"
//                 placeholder="1"
//                 value={formData.servings}
//                 onChange={handleChange}
//                 min={1}
//                 className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-bold text-gray-700">
//                 Calories
//               </label>
//               <input
//                 name="calories"
//                 type="number"
//                 placeholder="0"
//                 value={formData.calories}
//                 onChange={handleChange}
//                 min={0}
//                 className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
//               />
//             </div>

//             <div className="md:col-span-2 space-y-2">
//               <label className="text-sm font-bold text-gray-700">
//                 Short Description
//               </label>
//               <textarea
//                 name="description"
//                 placeholder="Enter a brief description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 rows="3"
//                 className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 resize-none"
//               />
//             </div>

//             {/* Array fields */}
//             {["ingredients", "tools", "instructions"].map((key) => (
//               <div key={key} className="md:col-span-2">
//                 <label className="font-bold capitalize text-gray-700 mb-2 block">
//                   {key}
//                 </label>

//                 {(formData[key] || [""]).map((v, i) => (
//                   <div key={i} className="flex gap-2 mt-2 items-center">
//                     <input
//                       value={v}
//                       onChange={(e) =>
//                         handleArrayChange(key, i, e.target.value)
//                       }
//                       className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300"
//                       placeholder={`Enter ${key.slice(0, -1)}...`}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => removeField(key, i)}
//                       className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-all duration-300"
//                       disabled={(formData[key] || []).length === 1}
//                       title={
//                         (formData[key] || []).length === 1
//                           ? "At least one required"
//                           : "Remove"
//                       }
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}

//                 <button
//                   type="button"
//                   onClick={() => addField(key)}
//                   className="text-sm text-orange-500 mt-2 hover:text-orange-700 font-bold"
//                 >
//                   + Add {key.slice(0, -1)}
//                 </button>
//               </div>
//             ))}

//             <div className="md:col-span-2 space-y-2">
//               <label className="text-sm font-bold text-gray-700">
//                 Nutrition (optional)
//               </label>
//               <textarea
//                 name="nutrition"
//                 placeholder="Enter nutrition information"
//                 value={formData.nutrition}
//                 onChange={handleChange}
//                 rows="2"
//                 className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 resize-none"
//               />
//             </div>

//             <div className="md:col-span-2 flex gap-4">
//               <button
//                 onClick={handleSubmit}
//                 disabled={uploading}
//                 className={`px-8 py-4 ${uploading ? "bg-gray-400" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:transform-none`}
//               >
//                 {uploading
//                   ? "⏳ Uploading..."
//                   : editId
//                     ? "💾 Update"
//                     : "➕ Submit"}
//               </button>

//               {editId && (
//                 <button
//                   type="button"
//                   onClick={resetForm}
//                   disabled={uploading}
//                   className="px-8 py-4 bg-gray-300 text-black rounded-xl font-bold hover:bg-gray-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
//                 >
//                   ❌ Cancel Edit
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Modal */}
//         {modalOpen && selectedRecipe && (
//           <div
//             className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-80 px-4"
//             onClick={closeModal}
//           >
//             <div
//               className="bg-white max-w-4xl w-full p-8 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto border-2 border-orange-200"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 onClick={closeModal}
//                 className="absolute top-4 right-4 text-4xl font-bold text-red-600 hover:text-red-700 transition-colors"
//                 aria-label="Close modal"
//               >
//                 ×
//               </button>

//               <h2 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent mb-4">
//                 {selectedRecipe.name}
//               </h2>

//               <img
//                 src={
//                   selectedRecipe.imageUrl ||
//                   selectedRecipe.pic ||
//                   "https://placehold.co/600x300/f97316/white?text=Recipe"
//                 }
//                 alt={selectedRecipe.name}
//                 className="w-full max-h-96 object-cover rounded-2xl mb-6 border-2 border-orange-200 shadow-lg"
//               />

//               <p className="text-gray-700 mb-6 text-lg">
//                 {selectedRecipe.description || "No description available."}
//               </p>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
//                   <h3 className="font-bold text-orange-700 mb-2">⏱️ Times</h3>
//                   <p>Prep: {selectedRecipe.prepTime || 0} min</p>
//                   <p>Cooking: {selectedRecipe.cookingTime || 0} min</p>
//                 </div>

//                 <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
//                   <h3 className="font-bold text-orange-700 mb-2">🍽️ Details</h3>
//                   <p>Servings: {selectedRecipe.servings || 1}</p>
//                   <p>Calories: {selectedRecipe.calories || 0} kcal</p>
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <h3 className="font-bold text-lg text-orange-700 mb-3">
//                   📋 Ingredients
//                 </h3>
//                 <ul className="list-disc pl-5 space-y-1">
//                   {(Array.isArray(selectedRecipe.ingredients)
//                     ? selectedRecipe.ingredients
//                     : []
//                   ).map((ing, i) => (
//                     <li key={i} className="text-gray-700">
//                       {ing}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div className="mb-6">
//                 <h3 className="font-bold text-lg text-orange-700 mb-3">
//                   🔧 Tools
//                 </h3>
//                 <ul className="list-disc pl-5 space-y-1">
//                   {(Array.isArray(selectedRecipe.tools)
//                     ? selectedRecipe.tools
//                     : []
//                   ).map((tool, i) => (
//                     <li key={i} className="text-gray-700">
//                       {tool}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <div className="mb-6">
//                 <h3 className="font-bold text-lg text-orange-700 mb-3">
//                   📝 Instructions
//                 </h3>
//                 <ol className="list-decimal pl-5 space-y-2">
//                   {(Array.isArray(selectedRecipe.instructions)
//                     ? selectedRecipe.instructions
//                     : []
//                   ).map((step, i) => (
//                     <li key={i} className="text-gray-700">
//                       {step}
//                     </li>
//                   ))}
//                 </ol>
//               </div>

//               {selectedRecipe.nutrition && (
//                 <div className="mb-6">
//                   <h3 className="font-bold text-lg text-orange-700 mb-3">
//                     🍎 Nutrition
//                   </h3>
//                   <p className="text-gray-700">{selectedRecipe.nutrition}</p>
//                 </div>
//               )}

//               <div className="text-center text-sm text-gray-500 mt-6">
//                 Category:{" "}
//                 <span className="font-semibold text-orange-600">
//                   {selectedRecipe.category || "Uncategorized"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         <AdminFooter />
//       </main>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import AdminFooter from "../components/AdminFooter";
import AdminNavbar from "../components/AdminNavbar";
import { getToken } from "../utils/authStorage";
import BulkRecipeUpload from "../components/BulkRecipeUpload";

const API_BASE = "";

const CATEGORIES = [
  "All",
  "Chicken",
  "Beef",
  "Fish",
  "Soup",
  "Dessert",
  "Drink",
];

function normalize(str = "") {
  return String(str).toLowerCase().trim();
}

export default function ManageRecipePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    pic: "",
    category: "",
    description: "",
    prepTime: "",
    cookingTime: "",
    servings: "",
    calories: "",
    ingredients: [""],
    tools: [""],
    instructions: [""],
    nutrition: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const sidebarWidthDesktop = navOpen ? 240 : 64;

  // Fetch recipes helper
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setErr("");

      const q = search ? encodeURIComponent(search) : "";
      const cat = filterCategory ? encodeURIComponent(filterCategory) : "All";
      const url = `${API_BASE}/api/recipes?q=${q}&category=${cat}`;

      const res = await fetch(url);
      const data = await res.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load recipes");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchRecipes, 250);
    return () => clearTimeout(t);
  }, [search, filterCategory]);

  const filteredRecipes = useMemo(() => {
    const q = normalize(search);
    return (recipes || []).filter((r) => {
      const okCat =
        filterCategory === "All" ||
        String(r?.category) === String(filterCategory);
      const okText = !q || normalize(r?.name).includes(q);
      return okCat && okText;
    });
  }, [recipes, search, filterCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
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

  const handleArrayChange = (key, index, value) => {
    const updated = [...(formData[key] || [])];
    updated[index] = value;
    setFormData((p) => ({ ...p, [key]: updated }));
  };

  const addField = (key) => {
    setFormData((p) => ({ ...p, [key]: [...(p[key] || []), ""] }));
  };

  const removeField = (key, index) => {
    const updated = [...(formData[key] || [])];
    updated.splice(index, 1);
    setFormData((p) => ({ ...p, [key]: updated.length ? updated : [""] }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      pic: "",
      category: "",
      description: "",
      prepTime: "",
      cookingTime: "",
      servings: "",
      calories: "",
      ingredients: [""],
      tools: [""],
      instructions: [""],
      nutrition: "",
    });
    setEditId(null);
    setImageFile(null);
  };

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRecipe(null);
    document.body.style.overflow = "auto";
  };

  const handleEdit = (recipe) => {
    setEditId(recipe?._id);
    setFormData({
      name: recipe?.name || "",
      pic: recipe?.imageUrl || recipe?.pic || "",
      category: recipe?.category || "",
      description: recipe?.description || "",
      prepTime: recipe?.prepTime ?? "",
      cookingTime: recipe?.cookingTime ?? "",
      servings: recipe?.servings ?? "",
      calories: recipe?.calories ?? "",
      ingredients:
        Array.isArray(recipe?.ingredients) && recipe.ingredients.length
          ? recipe.ingredients
          : [""],
      tools:
        Array.isArray(recipe?.tools) && recipe.tools.length
          ? recipe.tools
          : [""],
      instructions:
        Array.isArray(recipe?.instructions) && recipe.instructions.length
          ? recipe.instructions
          : [""],
      nutrition: recipe?.nutrition || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        description: String(formData.description || "").trim(),
        pic: String(imageUrl || "").trim(),
        prepTime: Number(formData.prepTime || 0),
        cookingTime: Number(formData.cookingTime || 0),
        servings: Number(formData.servings || 1),
        calories: Number(formData.calories || 0),
        ingredients: (formData.ingredients || [])
          .map((x) => String(x || "").trim())
          .filter(Boolean),
        tools: (formData.tools || [])
          .map((x) => String(x || "").trim())
          .filter(Boolean),
        instructions: (formData.instructions || [])
          .map((x) => String(x || "").trim())
          .filter(Boolean),
        nutrition: String(formData.nutrition || "").trim(),
      };

      const isEdit = Boolean(editId);
      const url = isEdit
        ? `${API_BASE}/api/recipes/${editId}`
        : `${API_BASE}/api/recipes`;

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
        setRecipes((prev) =>
          prev.map((r) =>
            String(r._id) === String(editId) ? data?.recipe || r : r,
          ),
        );
        alert("Recipe updated!");
      } else {
        const created = data?.recipe;
        if (created) setRecipes((prev) => [created, ...prev]);
        alert("Recipe added!");
      }

      resetForm();
    } catch (e) {
      setErr(e?.message || "Failed to submit");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;

    try {
      setErr("");
      const token = getToken();
      if (!token) {
        alert("Token not found. Please login as admin.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/recipes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      setRecipes((prev) => prev.filter((r) => String(r._id) !== String(id)));
      if (String(editId) === String(id)) resetForm();
    } catch (e) {
      setErr(e?.message || "Failed to delete");
    }
  };

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        /* Ensure consistent border radius */
        .rounded-panel {
          border-radius: 1.25rem; /* 20px */
        }
        .btn-primary {
          background: linear-gradient(to right, #f97316, #ea580c);
          color: white;
        }
        .btn-primary:hover {
          background: linear-gradient(to right, #ea580c, #c2410c);
        }
        .btn-secondary {
          background-color: #f3f4f6;
          color: #1f2937;
        }
        .btn-secondary:hover {
          background-color: #e5e7eb;
        }
        .btn-danger {
          background: linear-gradient(to right, #ef4444, #dc2626);
          color: white;
        }
        .btn-danger:hover {
          background: linear-gradient(to right, #dc2626, #b91c1c);
        }
        .btn-info {
          background: linear-gradient(to right, #3b82f6, #2563eb);
          color: white;
        }
        .btn-info:hover {
          background: linear-gradient(to right, #2563eb, #1d4ed8);
        }
      `}</style>

      <AdminNavbar navOpen={navOpen} setNavOpen={setNavOpen} />

      <main
        className="flex-1 transition-all duration-300 p-4 sm:p-6 max-w-full overflow-auto"
        style={{ marginLeft: sidebarWidthDesktop }}
      >
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b-2 border-orange-300">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              📖 Manage Recipes
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBulkUpload(!showBulkUpload)}
                className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="hidden sm:inline">Bulk Upload</span>
              </button>
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-sm font-medium text-gray-600">
                  Total:{" "}
                </span>
                <span className="text-lg font-bold text-orange-600">
                  {filteredRecipes.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Upload */}
        {showBulkUpload && (
          <div className="mb-6 animate-fade-in rounded-panel bg-white p-5 shadow-sm border border-gray-200">
            <BulkRecipeUpload
              onSuccess={() => {
                fetchRecipes();
                setShowBulkUpload(false);
              }}
            />
          </div>
        )}

        {/* Error Banner */}
        {err && (
          <div className="mb-6 rounded-panel border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{err}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fade-in">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Recipes
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Category
            </label>
            <select
              id="category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden mb-10 rounded-panel bg-white shadow-sm border border-gray-200 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700 uppercase tracking-wide">
                    Image
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-700 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-10 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 border-4 border-gray-200 rounded-full animate-ping"></div>
                          <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-600">Loading recipes...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRecipes.length > 0 ? (
                  filteredRecipes.map((r) => (
                    <tr
                      key={r._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <img
                          src={
                            r.imageUrl ||
                            r.pic ||
                            "https://placehold.co/60x60/e5e7eb/6b7280?text=No+Image"
                          }
                          alt={r.name}
                          className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                          onError={(e) =>
                            (e.currentTarget.src =
                              "https://placehold.co/60x60/e5e7eb/6b7280?text=No+Image")
                          }
                        />
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-800">
                        {r.name}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 space-x-2">
                        <button
                          onClick={() => openModal(r)}
                          className="btn-primary px-3 py-1.5 text-xs rounded-md shadow-sm"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleEdit(r)}
                          className="btn-info px-3 py-1.5 text-xs rounded-md shadow-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="btn-danger px-3 py-1.5 text-xs rounded-md shadow-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl text-gray-300">📖</span>
                        <p className="text-gray-500">
                          No recipes match your filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-sm rounded-panel p-6 mb-10 border border-gray-200 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-800 mb-5 pb-3 border-b border-gray-200">
            {editId ? "✏️ Edit Recipe" : "➕ Add New Recipe"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipe Name *
                </label>
                <input
                  name="name"
                  placeholder="Enter recipe name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700 file:font-medium hover:file:bg-orange-100"
                />
                {imageFile && (
                  <p className="mt-1 text-xs text-green-600 font-medium">
                    ✅ Selected: {imageFile.name}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or Image URL
                </label>
                <input
                  name="pic"
                  placeholder="https://example.com/image.jpg"
                  value={formData.pic}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Prep Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prep Time (minutes)
                </label>
                <input
                  name="prepTime"
                  type="number"
                  min="0"
                  value={formData.prepTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Cooking Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cooking Time (minutes)
                </label>
                <input
                  name="cookingTime"
                  type="number"
                  min="0"
                  value={formData.cookingTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Servings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servings
                </label>
                <input
                  name="servings"
                  type="number"
                  min="1"
                  value={formData.servings}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Calories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories (per serving)
                </label>
                <input
                  name="calories"
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter a brief description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>

              {/* Ingredients */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients
                </label>
                {(formData.ingredients || [""]).map((v, i) => (
                  <div key={i} className="flex gap-2 mt-2 items-start">
                    <input
                      value={v}
                      onChange={(e) =>
                        handleArrayChange("ingredients", i, e.target.value)
                      }
                      placeholder="Enter ingredient..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeField("ingredients", i)}
                      disabled={(formData.ingredients || []).length === 1}
                      className="mt-1 px-3 py-2.5 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField("ingredients")}
                  className="mt-2 text-sm text-orange-600 font-medium hover:text-orange-800"
                >
                  + Add Ingredient
                </button>
              </div>

              {/* Tools */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tools / Equipment
                </label>
                {(formData.tools || [""]).map((v, i) => (
                  <div key={i} className="flex gap-2 mt-2 items-start">
                    <input
                      value={v}
                      onChange={(e) =>
                        handleArrayChange("tools", i, e.target.value)
                      }
                      placeholder="Enter tool..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeField("tools", i)}
                      disabled={(formData.tools || []).length === 1}
                      className="mt-1 px-3 py-2.5 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField("tools")}
                  className="mt-2 text-sm text-orange-600 font-medium hover:text-orange-800"
                >
                  + Add Tool
                </button>
              </div>

              {/* Instructions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                {(formData.instructions || [""]).map((v, i) => (
                  <div key={i} className="flex gap-2 mt-2 items-start">
                    <input
                      value={v}
                      onChange={(e) =>
                        handleArrayChange("instructions", i, e.target.value)
                      }
                      placeholder={`Step ${i + 1}...`}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeField("instructions", i)}
                      disabled={(formData.instructions || []).length === 1}
                      className="mt-1 px-3 py-2.5 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField("instructions")}
                  className="mt-2 text-sm text-orange-600 font-medium hover:text-orange-800"
                >
                  + Add Step
                </button>
              </div>

              {/* Nutrition */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nutrition Information (optional)
                </label>
                <textarea
                  name="nutrition"
                  placeholder="e.g., Protein: 20g, Fat: 10g..."
                  value={formData.nutrition}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className={`px-6 py-3 rounded-lg font-medium shadow-sm transition-all ${
                  uploading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "btn-primary hover:shadow-md"
                }`}
              >
                {uploading
                  ? "⏳ Uploading..."
                  : editId
                    ? "💾 Update Recipe"
                    : "➕ Add Recipe"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={uploading}
                  className="px-6 py-3 btn-secondary rounded-lg font-medium shadow-sm hover:shadow-md"
                >
                  ❌ Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Modal */}
        {modalOpen && selectedRecipe && (
          <div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60 px-4"
            onClick={closeModal}
          >
            <div
              className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700 font-bold"
                aria-label="Close"
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedRecipe.name}
              </h2>

              <img
                src={
                  selectedRecipe.imageUrl ||
                  selectedRecipe.pic ||
                  "https://placehold.co/600x300/e5e7eb/6b7280?text=No+Image"
                }
                alt={selectedRecipe.name}
                className="w-full h-64 object-cover rounded-xl mb-5 border border-gray-200"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://placehold.co/600x300/e5e7eb/6b7280?text=No+Image")
                }
              />

              <p className="text-gray-700 mb-5 leading-relaxed">
                {selectedRecipe.description || "No description available."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-800 mb-2">⏱️ Times</h3>
                  <p>Prep: {selectedRecipe.prepTime || 0} min</p>
                  <p>Cooking: {selectedRecipe.cookingTime || 0} min</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-800 mb-2">🍽️ Details</h3>
                  <p>Servings: {selectedRecipe.servings || 1}</p>
                  <p>Calories: {selectedRecipe.calories || 0} kcal</p>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-2">📋 Ingredients</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {(Array.isArray(selectedRecipe.ingredients)
                    ? selectedRecipe.ingredients
                    : []
                  ).map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-2">🔧 Tools</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {(Array.isArray(selectedRecipe.tools)
                    ? selectedRecipe.tools
                    : []
                  ).map((tool, i) => (
                    <li key={i}>{tool}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-5">
                <h3 className="font-bold text-gray-800 mb-2">
                  📝 Instructions
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  {(Array.isArray(selectedRecipe.instructions)
                    ? selectedRecipe.instructions
                    : []
                  ).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {selectedRecipe.nutrition && (
                <div className="mb-5">
                  <h3 className="font-bold text-gray-800 mb-2">🍎 Nutrition</h3>
                  <p className="text-gray-700">{selectedRecipe.nutrition}</p>
                </div>
              )}

              <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                Category:{" "}
                <span className="font-semibold text-orange-600">
                  {selectedRecipe.category || "Uncategorized"}
                </span>
              </div>
            </div>
          </div>
        )}

        <AdminFooter />
      </main>
    </div>
  );
}
