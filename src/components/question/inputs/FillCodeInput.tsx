import type { FillCodeQuestion } from "@/types";

interface Props {
  question: FillCodeQuestion;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  disabled: boolean;
  revealCorrect?: boolean;
}

export function FillCodeInput({ question, value, onChange, disabled, revealCorrect }: Props) {
  const parts = question.codeTemplate.split(/\{\{blank:(\w+)\}\}/g);

  return (
    <pre className="overflow-x-auto rounded-lg bg-[#011627] p-3 font-mono text-[13px] leading-relaxed text-slate-100">
      <code className="whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (i % 2 === 0) return <span key={i}>{part}</span>;
          const blank = question.blanks.find((b) => b.id === part);
          const displayValue = revealCorrect ? blank?.acceptedAnswers[0] ?? "" : value[part] ?? "";
          return (
            <input
              key={i}
              type="text"
              disabled={disabled}
              value={displayValue}
              onChange={(e) => onChange({ ...value, [part]: e.target.value })}
              spellCheck={false}
              autoComplete="off"
              className={`mx-1 inline-block min-w-[4ch] rounded border-b-2 bg-transparent px-1 font-mono text-[13px] text-brand-300 outline-none ${
                revealCorrect
                  ? "border-emerald-400 text-emerald-300"
                  : "border-brand-500 focus:border-brand-300"
              }`}
              style={{ width: `${Math.max(4, displayValue.length + 1)}ch` }}
            />
          );
        })}
      </code>
    </pre>
  );
}
