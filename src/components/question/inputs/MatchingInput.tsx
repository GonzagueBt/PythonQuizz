import { useMemo } from "react";
import type { MatchingQuestion } from "@/types";
import { shuffle } from "@/engine/selection";

interface Props {
  question: MatchingQuestion;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled: boolean;
}

export function MatchingInput({ question, value, onChange, disabled }: Props) {
  const shuffledRight = useMemo(() => shuffle(question.pairs), [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-2">
      {question.pairs.map((pair) => {
        const selected = value[pair.id];
        const isCorrect = disabled && selected === pair.id;
        const isWrong = disabled && selected !== undefined && selected !== pair.id;
        return (
          <div
            key={pair.id}
            className={`flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
              isCorrect
                ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20"
                : isWrong
                  ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                  : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <span className="flex-1 text-sm font-medium">{pair.left}</span>
            <select
              disabled={disabled}
              value={selected ?? ""}
              onChange={(e) => onChange({ ...value, [pair.id]: e.target.value })}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="" disabled>
                Choisir...
              </option>
              {shuffledRight.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.right}
                </option>
              ))}
            </select>
            {isCorrect && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
            {isWrong && (
              <span className="text-xs text-red-600 dark:text-red-400">
                Attendu : {pair.right}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
