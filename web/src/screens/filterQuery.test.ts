import { describe, expect, it } from "vitest";

const filterQueryModule = "./filterQuery";

async function loadHelpers() {
  return await import(/* @vite-ignore */ filterQueryModule);
}

describe("filterQuery", () => {
  it("reads an empty filter when q is absent", async () => {
    const { readFilterQuery } = await loadHelpers();

    expect(readFilterQuery(new URLSearchParams())).toBe("");
  });

  it("reads the filter from q", async () => {
    const { readFilterQuery } = await loadHelpers();

    expect(readFilterQuery(new URLSearchParams("q=ali"))).toBe("ali");
  });

  it("sets q to the given value", async () => {
    const { withFilterQuery } = await loadHelpers();

    expect(withFilterQuery(new URLSearchParams(), "ali").get("q")).toBe("ali");
  });

  it("removes q when the value is empty", async () => {
    const { withFilterQuery } = await loadHelpers();

    expect(withFilterQuery(new URLSearchParams("q=ali"), "").has("q")).toBe(false);
  });

  it("preserves other params", async () => {
    const { withFilterQuery } = await loadHelpers();

    expect(withFilterQuery(new URLSearchParams("sort=name"), "ali").get("sort")).toBe("name");
  });

  it("does not mutate the params it was given", async () => {
    const { withFilterQuery } = await loadHelpers();
    const original = new URLSearchParams("q=ali");

    withFilterQuery(original, "bob");

    expect(original.get("q")).toBe("ali");
  });
});
