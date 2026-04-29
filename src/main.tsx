import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "@/app/App";
import "@/styles/globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  // Fail loudly. The HTML shell guarantees this element exists; if it's missing
  // it almost always indicates a bundler/template misconfiguration that we want
  // to surface immediately rather than silently no-op.
  throw new Error("Root element #root not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
