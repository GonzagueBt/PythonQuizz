export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
