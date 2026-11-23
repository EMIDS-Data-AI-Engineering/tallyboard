const FILTER_PARAM = "q";

export function readFilterQuery(searchParams: URLSearchParams): string {
  return searchParams.get(FILTER_PARAM) ?? "";
}

export function withFilterQuery(searchParams: URLSearchParams, value: string): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  if (value === "") {
    next.delete(FILTER_PARAM);
  } else {
    next.set(FILTER_PARAM, value);
  }
  return next;
}
