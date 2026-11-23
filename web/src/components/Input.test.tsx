// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const inputModule = "./Input";

afterEach(cleanup);

async function renderInput(props: Record<string, unknown> = {}) {
  const { Input } = await import(/* @vite-ignore */ inputModule);
  return render(<Input label="Quantity" {...props} />);
}

describe("Input in isolation", () => {
  it("renders with an associated label and no axe violations", async () => {
    const { axe } = await import("jest-axe");
    const { container } = await renderInput();

    expect(screen.getByLabelText("Quantity")).toBeTruthy();
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe("Input integer mode", () => {
  it("surfaces typed -5 as raw '-5' and integer -5 to the parent", async () => {
    const onValueChange = vi.fn();
    const onIntegerChange = vi.fn();
    await renderInput({ onValueChange, onIntegerChange });

    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "-5" } });

    expect(onValueChange).toHaveBeenLastCalledWith("-5");
    expect(onIntegerChange).toHaveBeenLastCalledWith(-5);
    expect(screen.getByLabelText("Quantity")).toHaveValue("-5");
  });

  it("surfaces a lone '-' as raw '-' and integer null", async () => {
    const onValueChange = vi.fn();
    const onIntegerChange = vi.fn();
    await renderInput({ onValueChange, onIntegerChange });

    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "-" } });

    expect(onValueChange).toHaveBeenLastCalledWith("-");
    expect(onIntegerChange).toHaveBeenLastCalledWith(null);
  });

  it("surfaces non-numeric text as integer null", async () => {
    const onIntegerChange = vi.fn();
    await renderInput({ onIntegerChange });
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "abc" } });
    expect(onIntegerChange).toHaveBeenLastCalledWith(null);
  });

  it("uses type=text, no inputMode and pattern -?[0-9]*", async () => {
    await renderInput({ onIntegerChange: vi.fn() });
    const field = screen.getByLabelText("Quantity");

    expect(field).toHaveAttribute("type", "text");
    expect(field).not.toHaveAttribute("inputmode");
    expect(field).toHaveAttribute("pattern", "-?[0-9]*");
  });
});
