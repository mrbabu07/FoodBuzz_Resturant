import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild", // Changed from terser to esbuild (built-in, faster)
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          vendor: ["react", "react-dom", "react-router-dom"],
          // UI libraries
          ui: ["react-hot-toast", "framer-motion"],
          // Chart libraries
          charts: ["chart.js", "react-chartjs-2"],
          // Icons
          icons: ["react-icons", "lucide-react"],
          // Utilities
          utils: ["papaparse", "jspdf", "jspdf-autotable", "xlsx"],
        },
      },
    },
    chunkSizeWarningLimit: 1500, // Increased limit
  },
  esbuild: {
    drop: ["console", "debugger"], // Remove console.log and debugger in production
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
});
