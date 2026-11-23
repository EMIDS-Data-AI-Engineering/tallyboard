import { useId, type ChangeEvent, type InputHTMLAttributes } from "react";
import { joinClasses } from "./joinClasses";
import { parseInteger } from "./parseInteger";

const INTEGER_PATTERN = "-?[0-9]*";
const FIELD_CLASSES =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-text " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  onValueChange?: (raw: string) => void;
  onIntegerChange?: (value: number | null) => void;
}

export function Input({ label, onValueChange, onIntegerChange, onChange, className, ...rest }: InputProps) {
  const id = useId();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    onChange?.(event);
    onValueChange?.(raw);
    onIntegerChange?.(parseInteger(raw));
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium text-text">{label}</label>
      <input
        id={id}
        type="text"
        pattern={onIntegerChange ? INTEGER_PATTERN : undefined}
        className={joinClasses(FIELD_CLASSES, className)}
        onChange={handleChange}
        {...rest}
      />
    </div>
  );
}
