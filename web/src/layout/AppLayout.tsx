import { Outlet } from "react-router-dom";

const MAIN_CONTENT_ID = "main-content";

export default function AppLayout() {
  return (
    <>
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-text focus:outline-2 focus:outline-offset-2 focus:outline-focus"
      >Skip to main content</a>
      <main id={MAIN_CONTENT_ID} className="app" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
