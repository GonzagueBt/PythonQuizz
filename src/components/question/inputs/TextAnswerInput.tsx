interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
  monospace?: boolean;
  multiline?: boolean;
}

export function TextAnswerInput({ value, onChange, disabled, placeholder, monospace, multiline }: Props) {
  const baseClasses = `w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
    monospace ? "font-mono" : ""
  }`;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={4}
        className={baseClasses}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      className={baseClasses}
    />
  );
}
