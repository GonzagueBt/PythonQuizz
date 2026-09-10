import { useEffect, useRef, useState } from "react";
import type { Question } from "@/types";
import { checkAnswer, type ValidationResult } from "@/engine/validation";
import { createInitialDraft, draftToAnswer, isDraftReady, type Draft } from "@/engine/draft";
import { AnswerInput } from "./AnswerInput";
import { HintPanel } from "./HintPanel";
import { CourseHelpPanel } from "./CourseHelpPanel";
import { ExplanationPanel } from "./ExplanationPanel";
import { QuestionMeta } from "./QuestionMeta";
import { RichText } from "@/components/ui/RichText";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Button } from "@/components/ui/Button";

interface Props {
  question: Question;
  examMode?: boolean;
  favorite: boolean;
  difficult: boolean;
  onToggleFavorite: () => void;
  onToggleDifficult: () => void;
  onAnswered: (correct: boolean, timeMs: number) => void;
  onNext: () => void;
  isLast?: boolean;
  questionNumber?: number;
  totalQuestions?: number;
}

export function QuestionPlayer({
  question,
  examMode = false,
  favorite,
  difficult,
  onToggleFavorite,
  onToggleDifficult,
  onAnswered,
  onNext,
  isLast = false,
  questionNumber,
  totalQuestions,
}: Props) {
  const [draft, setDraft] = useState<Draft>(() => createInitialDraft(question));
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [courseOpen, setCourseOpen] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    setDraft(createInitialDraft(question));
    setResult(null);
    setCourseOpen(false);
    startRef.current = Date.now();
  }, [question]);

  const ready = isDraftReady(question, draft);
  const submitted = result !== null;

  const handleSubmit = () => {
    if (!ready) return;
    const answer = draftToAnswer(draft);
    const validation = checkAnswer(question, answer);
    setResult(validation);
    onAnswered(validation.correct, Date.now() - startRef.current);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <QuestionMeta question={question} />
        <div className="flex items-center gap-2 text-lg">
          {questionNumber && totalQuestions && (
            <span className="mr-1 font-mono text-xs text-slate-400">
              {questionNumber}/{totalQuestions}
            </span>
          )}
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label="Marquer comme favori"
            title="À revoir"
            className={favorite ? "text-amber-500" : "text-slate-300 hover:text-amber-400 dark:text-slate-600"}
          >
            ★
          </button>
          <button
            type="button"
            onClick={onToggleDifficult}
            aria-label="Marquer comme difficile"
            title="Marquer difficile"
            className={`text-sm ${difficult ? "text-red-500" : "text-slate-300 hover:text-red-400 dark:text-slate-600"}`}
          >
            🔥
          </button>
        </div>
      </div>

      <div>
        {question.type !== "code-output" && question.code && (
          <CodeBlock code={question.code} language="python" />
        )}
        <RichText text={question.prompt} className="text-[15px] font-medium text-slate-900 dark:text-slate-100" />
      </div>

      <AnswerInput
        key={question.id}
        question={question}
        draft={draft}
        onDraftChange={setDraft}
        disabled={submitted}
        result={result ?? undefined}
      />

      {!examMode && !submitted && (
        <div className="space-y-2">
          <HintPanel key={question.id} hints={question.hints} />
          <CourseHelpPanel
            courseId={question.courseId}
            open={courseOpen}
            onToggle={() => setCourseOpen((o) => !o)}
          />
        </div>
      )}

      {!submitted ? (
        <Button type="button" onClick={handleSubmit} disabled={!ready}>
          Valider ma réponse
        </Button>
      ) : (
        <>
          {!examMode && (
            <ExplanationPanel
              question={question}
              draft={draft}
              result={result}
              onReviewCourse={question.courseId ? () => setCourseOpen(true) : undefined}
            />
          )}
          {!examMode && question.courseId && (
            <CourseHelpPanel
              courseId={question.courseId}
              open={courseOpen}
              onToggle={() => setCourseOpen((o) => !o)}
            />
          )}
          <Button type="button" onClick={onNext}>
            {isLast ? "Terminer" : "Question suivante →"}
          </Button>
        </>
      )}
    </div>
  );
}
