import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { questionById } from "@/data/questions";
import type { ExamRecord, Level, Topic } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import { QuestionPlayer } from "@/components/question/QuestionPlayer";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface ExamState {
  questionIds: string[];
  level?: Level | "mixed";
  topics?: Topic[];
  timerMinutes?: number;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ExamPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordAnswer, logExam, progress, toggleFavoriteQuestion, toggleDifficultQuestion } = useProgress();
  const state = location.state as ExamState | null;

  const questions = useMemo(
    () => (state?.questionIds ?? []).map((id) => questionById.get(id)).filter((q): q is NonNullable<typeof q> => Boolean(q)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    state?.timerMinutes ? state.timerMinutes * 60 : null,
  );
  const startedAt = useRef(Date.now());
  const finished = useRef(false);

  const finishExam = (finalAnswers: { questionId: string; correct: boolean }[]) => {
    if (finished.current) return;
    finished.current = true;
    const correctCount = finalAnswers.filter((a) => a.correct).length;

    const byTopic = new Map<Topic, { correct: number; total: number }>();
    for (const a of finalAnswers) {
      const q = questionById.get(a.questionId);
      if (!q) continue;
      const entry = byTopic.get(q.topic) ?? { correct: 0, total: 0 };
      entry.total += 1;
      if (a.correct) entry.correct += 1;
      byTopic.set(q.topic, entry);
    }
    const weakTopics = Array.from(byTopic.entries())
      .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.6)
      .map(([topic]) => topic);

    const examRecord: ExamRecord = {
      id: `exam-${Date.now()}`,
      startedAt: startedAt.current,
      finishedAt: Date.now(),
      level: state?.level ?? "mixed",
      topics: state?.topics ?? [],
      totalQuestions: questions.length,
      correctCount,
      scorePercent: questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0,
      weakTopics,
      questionIds: questions.map((q) => q.id),
      answeredCorrectly: finalAnswers.filter((a) => a.correct).map((a) => a.questionId),
    };
    logExam(examRecord);
    navigate("/examen/resultat", { state: { examRecord, answers: finalAnswers } });
  };

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      finishExam(answers);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  if (!state?.questionIds?.length || questions.length === 0) {
    return <Navigate to="/examen" replace />;
  }

  const question = questions[index];
  const qProgress = progress.questions[question.id];
  const isLast = index === questions.length - 1;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Question {index + 1} / {questions.length}
        </span>
        {secondsLeft !== null && (
          <span
            className={`font-mono font-semibold ${secondsLeft < 60 ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}`}
          >
            ⏱ {formatTime(Math.max(0, secondsLeft))}
          </span>
        )}
      </div>
      <ProgressBar value={index / questions.length} />

      <Card>
        <QuestionPlayer
          key={question.id}
          question={question}
          examMode
          favorite={qProgress?.favorite ?? false}
          difficult={qProgress?.markedDifficult ?? false}
          onToggleFavorite={() => toggleFavoriteQuestion(question.id)}
          onToggleDifficult={() => toggleDifficultQuestion(question.id)}
          onAnswered={(correct) => {
            recordAnswer(question.id, correct);
            setAnswers((a) => [...a, { questionId: question.id, correct }]);
          }}
          onNext={() => {
            if (isLast) {
              finishExam([...answers]);
            } else {
              setIndex((i) => i + 1);
            }
          }}
          isLast={isLast}
        />
      </Card>
    </div>
  );
}
