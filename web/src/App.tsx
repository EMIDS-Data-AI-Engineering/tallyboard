import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { appRoutes } from "./routes/routeTable";

export default function App() {
  const [router] = useState(() => createBrowserRouter(appRoutes));
  return <RouterProvider router={router} />;
}
