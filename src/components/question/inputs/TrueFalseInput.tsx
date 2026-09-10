interface Props {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  disabled: boolean;
  correctAnswer?: boolean;
}

export function TrueFalseInput({ value, onChange, disabled, correctAnswer }: Props) {
  const options: { label: string; val: boolean }[] = [
    { label: "Vrai", val: true },
    { label: "Faux", val: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const selected = value === opt.val;
        let stateClasses =
          "border-slate-200 hover:border-brand-300 dark:border-slate-700 dark:hover:border-brand-600";
        if (correctAnswer !== undefined) {
          if (opt.val === correctAnswer) {
            stateClasses = "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20";
          } else if (selected) {
            stateClasses = "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20";
          }
        } else if (selected) {
          stateClasses = "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20";
        }

        return (
          <button
            key={opt.label}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.val)}
            className={`rounded-lg border px-4 py-3 text-center text-sm font-medium transition-colors disabled:cursor-default ${stateClasses}`}
          >
            {opt.label}
            {correctAnswer !== undefined && opt.val === correctAnswer && " ✓"}
          </button>
        );
      })}
    </div>
  );
}
