import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdf: ["jspdf", "jspdf-autotable"],
          canvas: ["html2canvas"],
          vendor: ["react", "react-dom", "react-router-dom", "axios"],
        },
      },
    },
  },
});
