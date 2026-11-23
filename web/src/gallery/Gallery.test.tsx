// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

const galleryModule = "./Gallery";

afterEach(cleanup);

async function renderGallery() {
  const { Gallery } = await import(/* @vite-ignore */ galleryModule);
  return render(<Gallery />);
}

describe("Gallery", () => {
  it("renders every primitive under a single h1", async () => {
    const { container } = await renderGallery();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("region").length).toBeGreaterThan(0);
    expect(container.querySelector(".grid")).not.toBeNull();
    expect(container.querySelector("button:disabled")).not.toBeNull();
  });

  it("has no axe violations", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderGallery();
    expect(container.querySelector("h1")).not.toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("does not centre content vertically in a scroll container", async () => {
    const { container } = await renderGallery();
    expect(container.querySelector(".justify-center")).toBeNull();
    expect(container.querySelector(".items-center")).toBeNull();
  });
});
