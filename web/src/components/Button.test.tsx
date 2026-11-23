// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const buttonModule = "./Button";
const VARIANTS = ["primary", "secondary", "danger"] as const;

afterEach(cleanup);

async function renderButton(props: Record<string, unknown> = {}) {
  const { Button } = await import(/* @vite-ignore */ buttonModule);
  return render(<Button {...props}>Save</Button>);
}

describe("Button in isolation", () => {
  it.each(VARIANTS)("renders the %s variant with its label and no axe violations", async (variant) => {
    const { axe } = await import("jest-axe");
    const { container } = await renderButton({ variant });

    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    expect((await axe(container)).violations).toEqual([]);
  });

  it("defaults to type=button so it never submits a form by accident", async () => {
    await renderButton();
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("calls onClick when enabled", async () => {
    const onClick = vi.fn();
    await renderButton({ onClick });
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("disabled Button", () => {
  it("ignores clicks and does not call onClick", async () => {
    const onClick = vi.fn();
    await renderButton({ disabled: true, onClick });
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("is natively disabled so keyboard focus skips it", async () => {
    await renderButton({ disabled: true });
    const button = screen.getByRole("button");
    button.focus();
    expect(button).toBeDisabled();
    expect(document.activeElement).not.toBe(button);
  });

  it("carries the disabled visual classes", async () => {
    await renderButton({ disabled: true });
    const classes = screen.getByRole("button").className.split(/\s+/);
    expect(classes).toEqual(
      expect.arrayContaining(["disabled:bg-disabled", "disabled:text-disabled-text", "disabled:cursor-not-allowed"]),
    );
  });

  it("has no axe violations", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderButton({ disabled: true });
    expect((await axe(container)).violations).toEqual([]);
  });
});
