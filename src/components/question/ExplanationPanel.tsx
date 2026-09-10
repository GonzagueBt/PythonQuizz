import type { ReactNode } from "react";
import type { Question } from "@/types";
import type { Draft } from "@/engine/draft";
import type { ValidationResult } from "@/engine/validation";
import { RichText } from "@/components/ui/RichText";
import { CodeBlock } from "@/components/ui/CodeBlock";

function describeCorrectAnswer(question: Question): ReactNode {
  switch (question.type) {
    case "multiple-choice":
      return question.options
        .filter((o) => o.correct)
        .map((o) => o.text)
        .join(" · ");
    case "true-false":
      return question.correct ? "Vrai" : "Faux";
    case "text":
      return question.acceptedAnswers[0];
    case "code-output":
      return <CodeBlock code={question.expectedOutput} language="text" />;
    case "fill-code":
      return question.blanks.map((b) => `${b.id}: ${b.acceptedAnswers[0]}`).join(" · ");
    case "matching":
      return question.pairs.map((p) => `${p.left} → ${p.right}`).join(" · ");
    case "ordering":
      return question.correctOrder
        .map((id) => question.items.find((it) => it.id === id)?.label)
        .join(" → ");
    case "code-editor":
      return <CodeBlock code={question.solution} language="python" />;
  }
}

function describeUserAnswer(question: Question, draft: Draft): ReactNode {
  if (draft.type === "multiple-choice") {
    const texts = question.type === "multiple-choice"
      ? question.options.filter((o) => draft.selectedOptionIds.includes(o.id)).map((o) => o.text)
      : [];
    return texts.join(" · ") || "(aucune sélection)";
  }
  if (draft.type === "true-false") return draft.value ? "Vrai" : "Faux";
  if (draft.type === "text") return draft.value || "(vide)";
  if (draft.type === "code-output") return <CodeBlock code={draft.value || "(vide)"} language="text" />;
  if (draft.type === "fill-code") return Object.entries(draft.values).map(([k, v]) => `${k}: ${v}`).join(" · ");
  if (draft.type === "matching" && question.type === "matching") {
    return question.pairs
      .map((p) => `${p.left} → ${question.pairs.find((x) => x.id === draft.selection[p.id])?.right ?? "?"}`)
      .join(" · ");
  }
  if (draft.type === "ordering" && question.type === "ordering") {
    return draft.order.map((id) => question.items.find((it) => it.id === id)?.label).join(" → ");
  }
  if (draft.type === "code-editor") return <CodeBlock code={draft.code} language="python" />;
  return null;
}

interface Props {
  question: Question;
  draft: Draft;
  result: ValidationResult;
  onReviewCourse?: () => void;
}

export function ExplanationPanel({ question, draft, result, onReviewCourse }: Props) {
  return (
    <div
      className={`space-y-3 rounded-lg border p-4 ${
        result.correct
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
          : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
      }`}
    >
      <div className="flex items-center gap-2 text-base font-semibold">
        {result.correct ? (
          <span className="text-emerald-700 dark:text-emerald-400">✓ Correct !</span>
        ) : (
          <span className="text-red-700 dark:text-red-400">✗ Incorrect</span>
        )}
      </div>

      {!result.correct && (
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="mb-1 font-medium text-slate-600 dark:text-slate-400">Ta réponse</p>
            <div className="text-slate-800 dark:text-slate-200">{describeUserAnswer(question, draft)}</div>
          </div>
          <div>
            <p className="mb-1 font-medium text-slate-600 dark:text-slate-400">Bonne réponse</p>
            <div className="text-slate-800 dark:text-slate-200">{describeCorrectAnswer(question)}</div>
          </div>
        </div>
      )}
      {result.correct && (
        <div className="text-sm">
          <p className="mb-1 font-medium text-slate-600 dark:text-slate-400">Réponse</p>
          <div className="text-slate-800 dark:text-slate-200">{describeCorrectAnswer(question)}</div>
        </div>
      )}

      <div className="border-t border-current/10 pt-3">
        <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">📖 Explication</p>
        <div className="text-sm text-slate-700 dark:text-slate-300">
          <RichText text={question.explanation} />
        </div>
        {question.pythonVersionNote && (
          <p className="mt-2 text-xs italic text-amber-700 dark:text-amber-400">
            ⓘ {question.pythonVersionNote}
          </p>
        )}
      </div>

      {question.courseId && onReviewCourse && (
        <button
          type="button"
          onClick={onReviewCourse}
          className="text-sm font-medium text-brand-700 underline decoration-dotted hover:text-brand-800 dark:text-brand-400"
        >
          Revoir le cours associé →
        </button>
      )}
    </div>
  );
}
