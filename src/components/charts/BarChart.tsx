export interface BarDatum {
  label: string;
  value: number; // 0..1
  sublabel?: string;
}

/** Minimal horizontal bar chart, no external charting library needed. */
export function BarChart({ data }: { data: BarDatum[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400">Pas encore de données.</p>;
  }

  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 flex-shrink-0 truncate text-slate-600 dark:text-slate-400" title={d.label}>
            {d.label}
          </span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
              style={{ width: `${Math.round(d.value * 100)}%` }}
            />
          </div>
          <span className="w-12 flex-shrink-0 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
            {Math.round(d.value * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}
