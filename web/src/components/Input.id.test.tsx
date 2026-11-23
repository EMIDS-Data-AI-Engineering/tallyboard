// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Input } from "./Input";

afterEach(cleanup);

describe("Input label association", () => {
  it("finds the input by its label without a caller id", () => {
    render(<Input label="Amount" />);
    expect(screen.getByLabelText("Amount")).toBeTruthy();
  });

  it("finds the input by its label and keeps the caller id", () => {
    render(<Input label="Amount" id="amount-field" />);
    expect(screen.getByLabelText("Amount").id).toBe("amount-field");
  });
});
