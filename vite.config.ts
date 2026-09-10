/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Base path matches the GitHub Pages project URL: https://<user>.github.io/PythonQuizz/
// Override with VITE_BASE_PATH if you deploy under a different path or a custom domain.
const base = process.env.VITE_BASE_PATH ?? "/PythonQuizz/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Python Training Lab",
        short_name: "PyLab",
        description: "Learn it. Break it. Understand it. — plateforme interactive de révision Python.",
        lang: "fr",
        start_url: ".",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#0f172a",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "icons/maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the built app shell (JS/CSS/HTML) so the app itself loads offline
        // after a first visit.
        globPatterns: ["**/*.{js,css,html,svg,png}"],
        runtimeCaching: [
          {
            // Pyodide's runtime (~10MB: interpreter + stdlib) is fetched from jsdelivr
            // on demand, the first time a "code-editor" exercise is run. Cache it
            // aggressively so subsequent runs — same session or a later visit — never
            // re-download it.
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/pyodide\//,
            handler: "CacheFirst",
            options: {
              cacheName: "pyodide-runtime-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 180, // 180 days — Pyodide assets are versioned/immutable
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
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
