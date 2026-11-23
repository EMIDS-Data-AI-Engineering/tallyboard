import { Outlet } from "react-router-dom";

const MAIN_CONTENT_ID = "main-content";

export default function AppLayout() {
  return (
    <>
      <a href={`#${MAIN_CONTENT_ID}`}>Skip to main content</a>
      <main id={MAIN_CONTENT_ID} className="app" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
