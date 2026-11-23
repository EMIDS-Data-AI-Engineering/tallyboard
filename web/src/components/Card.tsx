import { useId } from "react";
import type { HTMLAttributes } from "react";
import { joinClasses } from "./joinClasses";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: string;
}

export function Card({ title, children, className, ...rest }: CardProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={joinClasses("rounded-lg border border-border bg-surface p-4 text-text md:p-6", className)}
      {...rest}
    >
      {title && (
        <h2 id={titleId} className="mb-2 text-lg font-semibold">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
