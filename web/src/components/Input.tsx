import { useId } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { joinClasses } from "./joinClasses";
import { parseInteger } from "./parseInteger";

const INTEGER_PATTERN = "-?[0-9]*";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "onChange"> {
  label: string;
  onValueChange?: (value: string) => void;
  onIntegerChange?: (value: number | null) => void;
}

export function Input({ label, onValueChange, onIntegerChange, className, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    onValueChange?.(raw);
    onIntegerChange?.(parseInteger(raw));
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="font-medium text-text">
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        type="text"
        pattern={onIntegerChange ? INTEGER_PATTERN : undefined}
        onChange={handleChange}
        className={joinClasses(
          "rounded-md border border-border bg-surface px-3 py-2 text-text",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          className,
        )}
      />
    </div>
  );
}
