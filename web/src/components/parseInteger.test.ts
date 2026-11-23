import { describe, expect, it } from "vitest";

const parseIntegerModule = "./parseInteger";
const parse = async (raw: string) => (await import(/* @vite-ignore */ parseIntegerModule)).parseInteger(raw);

describe("parseInteger", () => {
  it.each([["-5", -5], ["42", 42], ["0", 0]])("parses %s as %d", async (raw, expected) => {
    expect(await parse(raw)).toBe(expected);
  });

  it("normalises negative zero to zero", async () => {
    expect(Object.is(await parse("-0"), 0)).toBe(true);
  });

  it.each(["-", "", "-1.5", "abc", "99999999999999999999", "-99999999999999999999"])(
    "returns null for %j",
    async (raw) => {
      expect(await parse(raw)).toBeNull();
    },
  );
});
