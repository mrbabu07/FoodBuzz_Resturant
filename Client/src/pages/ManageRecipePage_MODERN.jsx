import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { showSuccess, showError } from "../utils/toast";
import { getToken } from "../utils/authStorage";

const API_BASE = "http://localhost:5000";

const CATEGORIES = [
  "All",
  "Chicken",
  "Beef",
  "Fish",
  "Soup",
  "Dessert",
  "Drink",
  "Vegetarian",
  "Vegan",
];

export default function ManageRecipePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  useEffect(() => {
    loadRecipes();
  }, [selectedCategory]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const cat = selectedCategory !== "All" ? `&category=${encodeURIComponent(selectedCategory)}` : "";
      const res = await fetch(`${API_BASE}/api/recipes?${cat}`);
      const data = await res.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      showError("Failed to load recipes");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.pic;

      if (imageFile) {
        setUploading(true);
        const token = getToken();
        const imgFormData = new FormData();
        imgFormData.append("image", imageFile);
        imgFormData.append("name", imageFile.name.split(".")[0]);

        const imgRes = await fetch(`${API_BASE}/api/upload/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imgFormData,
        });

        const imgData = await imgRes.json();
        if (!imgRes.ok) throw new Error(imgData?.message || "Upload failed");
        imageUrl = imgData.url;
        setUploading(false);
      }

      const token = getToken();
      const payload = {
        ...formData,
        pic: imageUrl,
        ingredients: formData.ingredients.filter(Boolean),
        tools: formData.tools.filter(Boolean),
        i