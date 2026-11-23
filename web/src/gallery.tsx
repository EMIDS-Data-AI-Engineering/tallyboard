import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Gallery } from "./gallery/Gallery";
import "./components";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
