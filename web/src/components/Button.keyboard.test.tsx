// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

afterEach(cleanup);

const ACTIVATION_PHASE: Record<string, "keydown" | "keyup"> = { Enter: "keydown", " ": "keyup" };

/**
 * happy-dom does not turn key events into clicks, so this performs the browser's default action itself:
 * a focused button is clicked on Enter (keydown) or Space (keyup). HTMLElement.click() is a no-op on a
 * disabled control, which is what the disabled cases rely on; the enabled cases are the control.
 */
function pressKey(button: HTMLElement, key: string) {
  button.focus();
  for (const phase of ["keydown", "keyup"] as const) {
    const dispatch = phase === "keydown" ? fireEvent.keyDown : fireEvent.keyUp;
    const notPrevented = dispatch(button, { key });
    if (notPrevented && ACTIVATION_PHASE[key] === phase) button.click();
  }
}

function renderButton(disabled: boolean) {
  const onClick = vi.fn();
  render(<Button disabled={disabled} onClick={onClick}>Save</Button>);
  return { onClick, button: screen.getByRole("button", { name: "Save" }) };
}

describe("Button keyboard activation", () => {
  it.each(["Enter", " "])("an enabled Button calls onClick on %j", (key) => {
    const { onClick, button } = renderButton(false);
    pressKey(button, key);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each(["Enter", " "])("a disabled Button does not call onClick on %j", (key) => {
    const { onClick, button } = renderButton(true);
    pressKey(button, key);
    expect(onClick).not.toHaveBeenCalled();
  });
});
