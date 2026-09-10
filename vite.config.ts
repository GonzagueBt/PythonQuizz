/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path matches the GitHub Pages project URL: https://<user>.github.io/PythonQuizz/
// Override with VITE_BASE_PATH if you deploy under a different path or a custom domain.
const base = process.env.VITE_BASE_PATH ?? "/PythonQuizz/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          markdown: ["react-markdown", "remark-gfm", "prism-react-renderer"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
