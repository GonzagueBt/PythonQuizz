import type { HTMLAttributes, ReactNode } from "react";

type Tone = "neutral" | "brand" | "success" | "danger" | "warning";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  brand: "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: Tone;
}

export function Badge({ children, tone = "neutral", className = "", ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
