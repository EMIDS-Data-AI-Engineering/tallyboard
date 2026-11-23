import type { ReactNode } from "react";

export type GridColumns = 1 | 2 | 3 | 4;

const COLUMN_CLASSES: Record<GridColumns, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export interface GridProps {
  columns?: GridColumns;
  children: ReactNode;
}

export function Grid({ columns = 1, children }: GridProps) {
  return <div className={`grid grid-cols-1 gap-4 ${COLUMN_CLASSES[columns]}`}>{children}</div>;
}
