import type { HTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "", ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
