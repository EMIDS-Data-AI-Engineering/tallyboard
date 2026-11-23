// @vitest-environment happy-dom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

const gridModule = "./Grid";
const COLUMN_COUNTS = [1, 2, 3, 4];

afterEach(cleanup);

async function renderGrid(props: Record<string, unknown> = {}) {
  const { Grid } = await import(/* @vite-ignore */ gridModule);
  return render(<Grid {...props}><div>One</div><div>Two</div></Grid>);
}

describe("Grid", () => {
  it("stacks to one column below md by default", async () => {
    const { container } = await renderGrid();
    const classes = (container.firstElementChild as Element).className.split(/\s+/);
    expect(classes).toEqual(expect.arrayContaining(["grid", "grid-cols-1"]));
  });

  it.each(COLUMN_COUNTS)("uses %d columns at md and up while staying one column below", async (columns) => {
    const { container } = await renderGrid({ columns });
    const classes = (container.firstElementChild as Element).className.split(/\s+/);
    expect(classes).toContain("grid-cols-1");
    expect(classes).toContain(`md:grid-cols-${columns}`);
  });

  it("has no axe violations", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderGrid({ columns: 2 });
    expect((await axe(container)).violations).toEqual([]);
  });
});
