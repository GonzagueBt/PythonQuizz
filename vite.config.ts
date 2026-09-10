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
      // No installable-app manifest (no icon set to maintain) — this PWA setup exists
      // purely to cache the app shell and Pyodide runtime for fast repeat visits and
      // offline use, not to be "Add to Home Screen" installable.
      manifest: false,
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        // Precache the built app shell (JS/CSS/HTML) so the app itself loads offline
        // after a first visit.
        globPatterns: ["**/*.{js,css,html,svg}"],
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
