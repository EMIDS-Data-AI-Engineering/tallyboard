import { useId } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { joinClasses } from "./joinClasses";
import { parseInteger } from "./parseInteger";

const INTEGER_PATTERN = "-?[0-9]*";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode"> {
  label: string;
  onValueChange?: (raw: string) => void;
  onIntegerChange?: (value: number | null) => void;
}

export function Input({ label, onValueChange, onIntegerChange, onChange, className, ...rest }: InputProps) {
  const inputId = useId();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    onChange?.(event);
    onValueChange?.(raw);
    onIntegerChange?.(parseInteger(raw));
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-text font-medium">{label}</label>
      <input
        id={inputId}
        type="text"
        pattern={onIntegerChange ? INTEGER_PATTERN : undefined}
        className={joinClasses(
          "rounded-md border border-border bg-surface px-3 py-2 text-text",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          className,
        )}
        onChange={handleChange}
        {...rest}
      />
    </div>
  );
}
