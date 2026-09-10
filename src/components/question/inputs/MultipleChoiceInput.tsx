import type { MultipleChoiceQuestion } from "@/types";
import type { ValidationResult } from "@/engine/validation";
import { RichText } from "@/components/ui/RichText";

interface Props {
  question: MultipleChoiceQuestion;
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  result?: ValidationResult;
}

export function MultipleChoiceInput({ question, value, onChange, disabled, result }: Props) {
  const toggle = (optionId: string) => {
    if (disabled) return;
    if (question.multiple) {
      onChange(value.includes(optionId) ? value.filter((id) => id !== optionId) : [...value, optionId]);
    } else {
      onChange([optionId]);
    }
  };

  return (
    <div className="space-y-2">
      {question.options.map((option) => {
        const selected = value.includes(option.id);
        const feedback = result?.optionFeedback?.find((f) => f.optionId === option.id);
        let stateClasses =
          "border-slate-200 hover:border-brand-300 dark:border-slate-700 dark:hover:border-brand-600";
        if (feedback) {
          if (feedback.isCorrect) {
            stateClasses = "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20";
          } else if (feedback.wasSelected && !feedback.isCorrect) {
            stateClasses = "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20";
          }
        } else if (selected) {
          stateClasses = "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20";
        }

        return (
          <div key={option.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => toggle(option.id)}
              className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${stateClasses}`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center border text-[10px] ${
                  question.multiple ? "rounded" : "rounded-full"
                } ${selected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-400 dark:border-slate-500"}`}
              >
                {selected && "✓"}
              </span>
              <span className="flex-1">{option.text}</span>
              {feedback?.isCorrect && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
              {feedback?.wasSelected && !feedback.isCorrect && (
                <span className="text-red-600 dark:text-red-400">✗</span>
              )}
            </button>
            {feedback && !feedback.isCorrect && feedback.wasSelected && feedback.whyWrong && (
              <p className="ml-7 mt-1 text-xs text-red-600 dark:text-red-400">
                <RichText text={feedback.whyWrong} />
              </p>
            )}
          </div>
        );
      })}
      {question.multiple && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Plusieurs réponses sont possibles.</p>
      )}
    </div>
  );
}
