import { Suspense, lazy } from "react";
import type { Question } from "@/types";
import type { Draft } from "@/engine/draft";
import type { ValidationResult } from "@/engine/validation";
import { MultipleChoiceInput } from "./inputs/MultipleChoiceInput";
import { TrueFalseInput } from "./inputs/TrueFalseInput";
import { TextAnswerInput } from "./inputs/TextAnswerInput";
import { FillCodeInput } from "./inputs/FillCodeInput";
import { MatchingInput } from "./inputs/MatchingInput";
import { OrderingInput } from "./inputs/OrderingInput";
import { RichText } from "@/components/ui/RichText";

// CodeMirror pulls in a sizeable chunk of code (editor state, Python
// grammar) only needed for "code-editor" questions — lazy-load it so the
// rest of the app stays light.
const CodeEditorInput = lazy(() =>
  import("./inputs/CodeEditorInput").then((m) => ({ default: m.CodeEditorInput })),
);

interface Props {
  question: Question;
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  disabled: boolean;
  result?: ValidationResult;
}

export function AnswerInput({ question, draft, onDraftChange, disabled, result }: Props) {
  if (question.type === "multiple-choice" && draft.type === "multiple-choice") {
    return (
      <MultipleChoiceInput
        question={question}
        value={draft.selectedOptionIds}
        onChange={(selectedOptionIds) => onDraftChange({ type: "multiple-choice", selectedOptionIds })}
        disabled={disabled}
        result={result}
      />
    );
  }

  if (question.type === "true-false" && draft.type === "true-false") {
    return (
      <TrueFalseInput
        value={draft.value}
        onChange={(value) => onDraftChange({ type: "true-false", value })}
        disabled={disabled}
        correctAnswer={disabled ? question.correct : undefined}
      />
    );
  }

  if (question.type === "text" && draft.type === "text") {
    return (
      <TextAnswerInput
        value={draft.value}
        onChange={(value) => onDraftChange({ type: "text", value })}
        disabled={disabled}
        placeholder="Ta réponse..."
      />
    );
  }

  if (question.type === "code-output" && draft.type === "code-output") {
    return (
      <div className="space-y-2">
        {question.code && <RichText text={`\`\`\`python\n${question.code}\n\`\`\``} />}
        <TextAnswerInput
          value={draft.value}
          onChange={(value) => onDraftChange({ type: "code-output", value })}
          disabled={disabled}
          placeholder="Sortie attendue du programme..."
          monospace
          multiline
        />
      </div>
    );
  }

  if (question.type === "fill-code" && draft.type === "fill-code") {
    return (
      <FillCodeInput
        question={question}
        value={draft.values}
        onChange={(values) => onDraftChange({ type: "fill-code", values })}
        disabled={disabled}
        revealCorrect={disabled}
      />
    );
  }

  if (question.type === "matching" && draft.type === "matching") {
    return (
      <MatchingInput
        question={question}
        value={draft.selection}
        onChange={(selection) => onDraftChange({ type: "matching", selection })}
        disabled={disabled}
      />
    );
  }

  if (question.type === "ordering" && draft.type === "ordering") {
    return (
      <OrderingInput
        question={question}
        value={draft.order}
        onChange={(order) => onDraftChange({ type: "ordering", order })}
        disabled={disabled}
      />
    );
  }

  if (question.type === "code-editor" && draft.type === "code-editor") {
    return (
      <Suspense
        fallback={<div className="h-56 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />}
      >
        <CodeEditorInput
          question={question}
          value={{ code: draft.code, passedAll: draft.passedAll }}
          onChange={(value) => onDraftChange({ type: "code-editor", ...value })}
          disabled={disabled}
        />
      </Suspense>
    );
  }

  return null;
}
