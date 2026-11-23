import { describe, expect, it } from "vitest";

const joinClassesModule = "./joinClasses";
const load = async () => (await import(/* @vite-ignore */ joinClassesModule)).joinClasses;

describe("joinClasses", () => {
  it("joins class names with single spaces", async () => {
    expect((await load())("a", "b")).toBe("a b");
  });

  it("skips falsy entries", async () => {
    expect((await load())("a", undefined, false, null, "", "b")).toBe("a b");
  });

  it("returns an empty string for no input", async () => {
    expect((await load())()).toBe("");
  });
});
