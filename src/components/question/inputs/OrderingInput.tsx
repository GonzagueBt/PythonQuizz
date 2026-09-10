import type { OrderingQuestion } from "@/types";

interface Props {
  question: OrderingQuestion;
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
}

export function OrderingInput({ question, value, onChange, disabled }: Props) {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <ol className="space-y-2">
      {value.map((itemId, index) => {
        const item = question.items.find((it) => it.id === itemId)!;
        const isCorrectPosition = disabled && question.correctOrder[index] === itemId;
        const isWrongPosition = disabled && !isCorrectPosition;
        return (
          <li
            key={itemId}
            className={`flex items-center gap-3 rounded-lg border p-2.5 text-sm ${
              isCorrectPosition
                ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20"
                : isWrongPosition
                  ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                  : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold dark:bg-slate-700">
              {index + 1}
            </span>
            <span className="flex-1">{item.label}</span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Monter"
                disabled={disabled || index === 0}
                onClick={() => move(index, -1)}
                className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-30 dark:border-slate-600"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Descendre"
                disabled={disabled || index === value.length - 1}
                onClick={() => move(index, 1)}
                className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-30 dark:border-slate-600"
              >
                ↓
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
