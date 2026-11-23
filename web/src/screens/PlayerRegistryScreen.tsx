import { useSearchParams } from "react-router-dom";
import { readFilterQuery, withFilterQuery } from "./filterQuery";

export default function PlayerRegistryScreen() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      <h1>Player Registry</h1>
      <label htmlFor="player-filter" className="mr-3">Filter players</label>
      <input
        id="player-filter"
        type="search"
        value={readFilterQuery(searchParams)}
        onChange={(event) =>
          setSearchParams(withFilterQuery(searchParams, event.target.value), { replace: true })
        }
      />
    </>
  );
}
