import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <>
      <a href="#main-content">Skip to main content</a>
      <main id="main-content" className="app" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
