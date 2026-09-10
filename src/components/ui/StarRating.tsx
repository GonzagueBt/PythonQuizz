import type { Difficulty } from "@/types";

export function StarRating({ value }: { value: Difficulty }) {
  return (
    <span className="font-mono text-amber-500 dark:text-amber-400" title={`Difficulté ${value}/5`} aria-label={`Difficulté ${value} sur 5`}>
      {"★".repeat(value)}
      <span className="text-slate-300 dark:text-slate-700">{"★".repeat(5 - value)}</span>
    </span>
  );
}
