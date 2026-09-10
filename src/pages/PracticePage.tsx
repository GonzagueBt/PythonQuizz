import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { allQuestions, questionById } from "@/data/questions";
import { useProgress } from "@/hooks/useProgress";
import { QuestionPlayer } from "@/components/question/QuestionPlayer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { pickRandom } from "@/engine/selection";

interface PracticeState {
  questionIds?: string[];
  title?: string;
}

export function PracticePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { progress, recordAnswer, toggleFavoriteQuestion, toggleDifficultQuestion } = useProgress();

  const state = (location.state as PracticeState | null) ?? null;
  const title = state?.title ?? "Session d'entraînement";

  const questions = useMemo(() => {
    const ids = state?.questionIds;
    if (ids && ids.length > 0) {
      return ids.map((id) => questionById.get(id)).filter((q): q is NonNullable<typeof q> => Boolean(q));
    }
    return pickRandom(allQuestions, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  if (questions.length === 0) {
    return (
      <Card className="text-center">
        <p className="mb-4 text-slate-600 dark:text-slate-400">Aucune question à afficher pour cette sélection.</p>
        <Button onClick={() => navigate("/exercices")}>Choisir des exercices</Button>
      </Card>
    );
  }

  if (index >= questions.length) {
    const pct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    return (
      <Card className="mx-auto max-w-lg text-center">
        <h1 className="mb-2 text-xl font-bold">Session terminée 🎉</h1>
        <p className="mb-4 text-slate-600 dark:text-slate-400">
          {correctCount} / {answeredCount} bonnes réponses ({pct}%)
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setIndex(0);
              setCorrectCount(0);
              setAnsweredCount(0);
            }}
          >
            Refaire cette session
          </Button>
          <Button onClick={() => navigate("/exercices")}>Choisir d'autres exercices</Button>
          <Button variant="ghost" onClick={() => navigate("/")}>
            Accueil
          </Button>
        </div>
      </Card>
    );
  }

  const question = questions[index];
  const qProgress = progress.questions[question.id];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h1>
        <span className="font-mono text-sm text-slate-400">
          {index + 1} / {questions.length}
        </span>
      </div>
      <Card>
        <QuestionPlayer
          key={question.id}
          question={question}
          favorite={qProgress?.favorite ?? false}
          difficult={qProgress?.markedDifficult ?? false}
          onToggleFavorite={() => toggleFavoriteQuestion(question.id)}
          onToggleDifficult={() => toggleDifficultQuestion(question.id)}
          onAnswered={(correct) => {
            recordAnswer(question.id, correct);
            setAnsweredCount((c) => c + 1);
            if (correct) setCorrectCount((c) => c + 1);
          }}
          onNext={() => setIndex((i) => i + 1)}
          isLast={index === questions.length - 1}
          questionNumber={index + 1}
          totalQuestions={questions.length}
        />
      </Card>
    </div>
  );
}
