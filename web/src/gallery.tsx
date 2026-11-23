import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Gallery } from "./gallery/Gallery";
import { findRootElement } from "./rootElement";

createRoot(findRootElement(document)).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
