// Bulk Recipe Upload Component
import React, { useState } from "react";
import Papa from "papaparse";
import { apiFetch } from "../utils/api";

export default function BulkRecipeUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [showTemplate, setShowTemplate] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setResults(null);
    } else {
      alert("Please select a valid CSV file");
      e.target.value = "";
    }
  };

  const downloadTemplate = () => {
    const template = `name,category,description,prepTime,cookingTime,servings,calories,imageUrl,ingredients,instructions,difficulty
"Chicken Curry","Chicken","Delicious spicy chicken curry",15,30,4,450,"https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800","Chicken 500g; Onions 2; Tomatoes 3; Spices","1. Heat oil; 2. Add onions; 3. Add chicken; 4. Cook for 30 min","Medium"
"Beef Stew","Beef","Hearty beef stew with vegetables",20,120,6,520,"https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800","Beef 1kg; Carrots 3; Potatoes 4; Onions 2","1. Brown beef; 2. Add vegetables; 3. Simmer for 2 hours","Hard"`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recipe_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setUploading(true);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parseResults) => {
        const recipes = parseResults.data;

        if (recipes.length === 0) {
          alert("No recipes found in CSV file");
          setUploading(false);
          return;
        }

        // Validate and process recipes
        const processedRecipes = [];
        const errors = [];

        for (let i = 0; i < recipes.length; i++) {
          const row = recipes[i];
          const rowNum = i + 2; // +2 because of header and 0-index

          try {
            // Validate required fields
            if (!row.name || !row.category) {
              errors.push(`Row ${rowNum}: Missing name or category`);
              continue;
            }

            // Process recipe
            const recipe = {
              name: row.name.trim(),
              category: row.category.trim(),
              description: row.description?.trim() || "",
              prepTime: parseInt(row.prepTime) || 0,
              cookingTime: parseInt(row.cookingTime) || 0,
              servings: parseInt(row.servings) || 1,
              calories: parseInt(row.calories) || 0,
              imageUrl: row.imageUrl?.trim() || "",
              pic: row.imageUrl?.trim() || "",
              difficulty: row.difficulty?.trim() || "Medium",
              ingredients: row.ingredients
                ? row.ingredients
                    .split(";")
                    .map((i) => i.trim())
                    .filter(Boolean)
                : [],
              instructions: row.instructions
                ? row.instructions
                    .split(";")
                    .map((i) => i.trim())
                    .filter(Boolean)
                : [],
            };

            processedRecipes.push(recipe);
          } catch (err) {
            errors.push(`Row ${rowNum}: ${err.message}`);
          }
        }

        // Upload recipes
        const uploadResults = {
          total: recipes.length,
          success: 0,
          failed: 0,
          errors: [...errors],
        };

        for (const recipe of processedRecipes) {
          try {
            await apiFetch("/api/recipes", {
              method: "POST",
              body: JSON.stringify(recipe),
            });
            uploadResults.success++;
          } catch (err) {
            uploadResults.failed++;
            uploadResults.errors.push(`${recipe.name}: ${err.message}`);
          }
        }

        setResults(uploadResults);
        setUploading(false);
        setFile(null);

        if (uploadResults.success > 0 && onSuccess) {
          onSuccess();
        }
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
        setUploading(false);
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-orange-600">
          📤 Bulk Recipe Upload
        </h3>
        <button
          onClick={() => setShowTemplate(!showTemplate)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showTemplate ? "Hide" : "Show"} Instructions
        </button>
      </div>

      {showTemplate && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-2">
            📋 CSV Format Instructions
          </h4>
          <ul className="text-sm text-gray-700 space-y-1 mb-3">
            <li>
              • <strong>Required fields:</strong> name, category
            </li>
            <li>
              • <strong>Optional fields:</strong> description, prepTime,
              cookingTime, servings, calories, imageUrl, ingredients,
              instructions, difficulty
            </li>
            <li>
              • <strong>Categories:</strong> Chicken, Beef, Fish, Soup, Dessert,
              Drink, Pizza, Pasta, Salad, Rice, Sandwich, Appetizer, Vegetarian
            </li>
            <li>
              • <strong>Ingredients/Instructions:</strong> Separate multiple
              items with semicolons (;)
            </li>
            <li>
              • <strong>Difficulty:</strong> Easy, Medium, Hard
            </li>
          </ul>
          <button
            onClick={downloadTemplate}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Template CSV
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 disabled:opacity-50"
          />
          {file && (
            <p className="mt-2 text-sm text-green-600">
              ✓ Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 transition-all"
        >
          {uploading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
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
              Upload Recipes
            </>
          )}
        </button>

        {/* Results */}
        {results && (
          <div
            className={`p-4 rounded-lg border-2 ${
              results.failed === 0
                ? "bg-green-50 border-green-300"
                : "bg-yellow-50 border-yellow-300"
            }`}
          >
            <h4 className="font-bold text-lg mb-2">
              {results.failed === 0
                ? "✅ Upload Complete!"
                : "⚠️ Upload Complete with Errors"}
            </h4>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Total Rows:</strong> {results.total}
              </p>
              <p className="text-green-600">
                <strong>✓ Successful:</strong> {results.success}
              </p>
              {results.failed > 0 && (
                <p className="text-red-600">
                  <strong>✗ Failed:</strong> {results.failed}
                </p>
              )}
            </div>

            {results.errors.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-red-700 mb-1">Errors:</p>
                <div className="max-h-40 overflow-y-auto bg-white p-2 rounded border">
                  {results.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">
                      • {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
