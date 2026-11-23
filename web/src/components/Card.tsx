import { useId } from "react";
import type { ReactNode } from "react";

export interface CardProps {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className="rounded-lg border border-border bg-surface p-4 text-text md:p-6"
    >
      {title && <h2 id={titleId} className="mb-2 text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  );
}
