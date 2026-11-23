import type { ButtonHTMLAttributes } from "react";
import { joinClasses } from "./joinClasses";

export type ButtonVariant = "primary" | "secondary" | "danger";

const BASE_CLASSES =
  "rounded-md px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
  "disabled:bg-disabled disabled:text-disabled-text disabled:cursor-not-allowed";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-contrast",
  secondary: "bg-secondary text-secondary-contrast border border-border",
  danger: "bg-danger text-danger-contrast",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", type = "button", className, ...rest }: ButtonProps) {
  return <button type={type} className={joinClasses(BASE_CLASSES, VARIANT_CLASSES[variant], className)} {...rest} />;
}
