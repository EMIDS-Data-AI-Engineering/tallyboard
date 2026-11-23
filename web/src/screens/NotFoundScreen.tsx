import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../routes/routePaths";

export default function NotFoundScreen() {
  return (
    <>
      <h1>Page not found</h1>
      <Link to={ROUTE_PATHS.home}>Back to Home</Link>
    </>
  );
}
