import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { ProgressProvider } from "@/hooks/useProgress";
import "./index.css";

// Caches the app shell and, once fetched, the Pyodide runtime (~10MB) so
// repeat visits and repeat code exercises don't re-download either. Silent
// auto-update: a new deploy is picked up on the next full reload, no
// user-facing prompt needed for a learning tool like this one.
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </HashRouter>
  </React.StrictMode>,
);
