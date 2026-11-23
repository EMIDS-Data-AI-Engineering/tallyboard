// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
import type { ButtonVariant } from "./Button";

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "danger"];

afterEach(cleanup);

function renderButton(props: Record<string, unknown>) {
  render(<Button {...props}>Save</Button>);
  return screen.getByRole("button");
}

describe("disabled Button distinctness", () => {
  it.each(VARIANTS)("overrides the %s variant with its own disabled background, text and dashed border", (variant) => {
    const classes = renderButton({ variant, disabled: true }).className.split(" ");
    expect(classes).toEqual(
      expect.arrayContaining(["disabled:bg-disabled", "disabled:text-disabled-text", "disabled:border-dashed"]),
    );
    expect(classes).not.toContain("bg-disabled");
  });

  it.each(["{Enter}", " "])("does not call onClick for key %j on a disabled button", (key) => {
    const onClick = vi.fn();
    const button = renderButton({ disabled: true, onClick });
    fireEvent.keyDown(button, { key });
    fireEvent.keyUp(button, { key });
    expect(onClick).not.toHaveBeenCalled();
  });
});
