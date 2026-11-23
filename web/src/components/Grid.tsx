import type { HTMLAttributes } from "react";
import { joinClasses } from "./joinClasses";

export type GridColumns = 1 | 2 | 3 | 4;

const COLUMN_CLASSES: Record<GridColumns, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns;
}

export function Grid({ columns = 1, className, ...rest }: GridProps) {
  return <div className={joinClasses("grid grid-cols-1 gap-4", COLUMN_CLASSES[columns], className)} {...rest} />;
}
