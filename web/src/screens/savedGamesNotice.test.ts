import { describe, expect, it } from "vitest";

const noticeModule = "./savedGamesNotice";

async function noticeFor(count: number) {
  const { savedGamesNotice } = await import(/* @vite-ignore */ noticeModule);
  return savedGamesNotice(count);
}

describe("savedGamesNotice", () => {
  it("returns the empty notice for zero", async () => {
    expect(await noticeFor(0)).toBe("No saved games yet");
  });

  it("returns null for one saved game", async () => {
    expect(await noticeFor(1)).toBeNull();
  });

  it("returns null for many saved games", async () => {
    expect(await noticeFor(25)).toBeNull();
  });
});
