import type { ButtonHTMLAttributes } from "react";
import { joinClasses } from "./joinClasses";

export type ButtonVariant = "primary" | "secondary" | "danger";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-contrast",
  secondary: "bg-secondary text-secondary-contrast",
  danger: "bg-danger text-danger-contrast",
};

const BASE_CLASSES =
  "rounded px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
const DISABLED_CLASSES = "disabled:bg-disabled disabled:text-disabled-text disabled:cursor-not-allowed";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", type = "button", className, ...rest }: ButtonProps) {
  const classes = joinClasses(BASE_CLASSES, VARIANT_CLASSES[variant], DISABLED_CLASSES, className);
  return <button type={type} className={classes} {...rest} />;
}
