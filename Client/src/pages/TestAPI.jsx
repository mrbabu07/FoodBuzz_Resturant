import { useState, useEffect } from "react";

/**
 * API Test Page - Diagnose connection issues
 * Add this route to test API connectivity
 */
export default function TestAPI() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    const tests = {};

    // Test 1: Check environment variables
    tests.envVars = {
      VITE_API_URL: import.meta.env.VITE_API_URL || "NOT SET",
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    };

    // Test 2: Test backend health
    try {
      const healthUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${healthUrl}/`);
      const data = await response.json();
      tests.health = {
        status: "SUCCESS",
        url: `${healthUrl}/`,
        response: data,
      };
    } catch (error) {
      tests.health = {
        status: "FAILED",
        error: error.message,
      };
    }

    // Test 3: Test menu items endpoint
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/menu-items`);
      const data = await response.json();
      tests.menuItems = {
        status: "SUCCESS",
        url: `${apiUrl}/api/menu-items`,
        count: data.length,
        firstItem: data[0]?.name,
      };
    } catch (error) {
      tests.menuItems = {
        status: "FAILED",
        error: error.message,
      };
    }

    // Test 4: Test with full URL (bypass env var)
    try {
      const response = await fetch(
        "https://foodbuzz-api.vercel.app/api/menu-items",
      );
      const data = await response.json();
      tests.directURL = {
        status: "SUCCESS",
        count: data.length,
        note: "Direct URL works - check VITE_API_URL env var",
      };
    } catch (error) {
      tests.directURL = {
        status: "FAILED",
        error: error.message,
        note: "Backend might be down or CORS issue",
      };
    }

    setResults(tests);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    return status === "SUCCESS" ? "text-green-600" : "text-red-600";
  };

  const getStatusBg = (status) => {
    return status === "SUCCESS" ? "bg-green-50" : "bg-red-50";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Testing API connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 API Connection Test
          </h1>
          <p className="text-gray-600">
            Diagnostic page to test backend connectivity
          </p>
        </div>

        {/* Test 1: Environment Variables */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            1️⃣ Environment Variables
          </h2>
          <div className="space-y-2">
            {Object.entries(results.envVars || {}).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <span className="font-mono text-sm font-semibold">{key}:</span>
                <span
                  className={`font-mono text-sm ${value === "NOT SET" ? "text-red-600" : "text-green-600"}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
          {results.envVars?.VITE_API_URL === "NOT SET" && (
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
              <p className="font-semibold">⚠️ Warning</p>
              <p className="text-sm mt-1">
                VITE_API_URL is not set. Add it in Netlify: Site settings →
                Environment variables
              </p>
              <p className="text-sm mt-1 font-mono">
                VITE_API_URL=http://localhost:5173
              </p>
            </div>
          )}
        </div>

        {/* Test 2: Backend Health */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            2️⃣ Backend Health Check
          </h2>
          <div className={`p-4 rounded ${getStatusBg(results.health?.status)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Status:</span>
              <span
                className={`font-bold ${getStatusColor(results.health?.status)}`}
              >
                {results.health?.status}
              </span>
            </div>
            {results.health?.url && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">URL:</span> {results.health.url}
              </div>
            )}
            {results.health?.response && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Response:</span>{" "}
                {JSON.stringify(results.health.response)}
              </div>
            )}
            {results.health?.error && (
              <div className="text-sm text-red-600 mt-2">
                <span className="font-semibold">Error:</span>{" "}
                {results.health.error}
              </div>
            )}
          </div>
        </div>

        {/* Test 3: Menu Items */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            3️⃣ Menu Items Endpoint
          </h2>
          <div
            className={`p-4 rounded ${getStatusBg(results.menuItems?.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Status:</span>
              <span
                className={`font-bold ${getStatusColor(results.menuItems?.status)}`}
              >
                {results.menuItems?.status}
              </span>
            </div>
            {results.menuItems?.url && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">URL:</span>{" "}
                {results.menuItems.url}
              </div>
            )}
            {results.menuItems?.count && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Items Found:</span>{" "}
                {results.menuItems.count}
              </div>
            )}
            {results.menuItems?.firstItem && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">First Item:</span>{" "}
                {results.menuItems.firstItem}
              </div>
            )}
            {results.menuItems?.error && (
              <div className="text-sm text-red-600 mt-2">
                <span className="font-semibold">Error:</span>{" "}
                {results.menuItems.error}
              </div>
            )}
          </div>
        </div>

        {/* Test 4: Direct URL */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            4️⃣ Direct URL Test (Bypass Env Var)
          </h2>
          <div
            className={`p-4 rounded ${getStatusBg(results.directURL?.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Status:</span>
              <span
                className={`font-bold ${getStatusColor(results.directURL?.status)}`}
              >
                {results.directURL?.status}
              </span>
            </div>
            {results.directURL?.count && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Items Found:</span>{" "}
                {results.directURL.count}
              </div>
            )}
            {results.directURL?.note && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Note:</span>{" "}
                {results.directURL.note}
              </div>
            )}
            {results.directURL?.error && (
              <div className="text-sm text-red-600 mt-2">
                <span className="font-semibold">Error:</span>{" "}
                {results.directURL.error}
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Diagnosis</h2>
          <div className="space-y-3">
            {results.envVars?.VITE_API_URL === "NOT SET" && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-800">
                <p className="font-semibold">❌ VITE_API_URL Not Set</p>
                <p className="text-sm mt-1">
                  Go to Netlify Dashboard → Site settings → Environment
                  variables
                </p>
                <p className="text-sm mt-1">
                  Add: VITE_API_URL = http://localhost:5173
                </p>
                <p className="text-sm mt-1">
                  Then: Deploys → Trigger deploy → Clear cache and deploy site
                </p>
              </div>
            )}

            {results.directURL?.status === "SUCCESS" &&
              results.menuItems?.status === "FAILED" && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                  <p className="font-semibold">
                    ⚠️ Backend Works, But Env Var Issue
                  </p>
                  <p className="text-sm mt-1">
                    Direct URL test passed, but env var test failed.
                  </p>
                  <p className="text-sm mt-1">
                    Check if VITE_API_URL is set correctly in Netlify.
                  </p>
                </div>
              )}

            {results.directURL?.status === "FAILED" && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-800">
                <p className="font-semibold">❌ Backend Not Accessible</p>
                <p className="text-sm mt-1">
                  Backend might be down or CORS is blocking requests.
                </p>
                <p className="text-sm mt-1">
                  Check Vercel deployment and CORS configuration.
                </p>
              </div>
            )}

            {results.menuItems?.status === "SUCCESS" && (
              <div className="p-4 bg-green-50 border-l-4 border-green-400 text-green-800">
                <p className="font-semibold">✅ Everything Working!</p>
                <p className="text-sm mt-1">
                  API connection is successful. Your app should work correctly.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={testAPI}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🔄 Run Tests Again
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mt-6 rounded">
          <h3 className="font-bold text-blue-900 mb-2">
            📖 How to Use This Page
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Check all test results above</li>
            <li>Follow the diagnosis recommendations</li>
            <li>Make changes in Netlify/Vercel dashboards</li>
            <li>Click "Run Tests Again" to verify fixes</li>
            <li>Once all tests pass, your app will work correctly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
