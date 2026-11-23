import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./App.css";
import { findRootElement } from "./rootElement";

createRoot(findRootElement(document)).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
