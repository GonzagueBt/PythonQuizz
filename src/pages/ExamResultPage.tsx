import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { questionById } from "@/data/questions";
import type { ExamRecord } from "@/types";
import { TOPIC_LABELS } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RichText } from "@/components/ui/RichText";

interface ResultState {
  examRecord: ExamRecord;
  answers: { questionId: string; correct: boolean }[];
}

export function ExamResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  if (!state?.examRecord) return <Navigate to="/examen" replace />;

  const { examRecord, answers } = state;
  const incorrectIds = answers.filter((a) => !a.correct).map((a) => a.questionId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="text-center">
        <p className="text-sm uppercase tracking-wide text-slate-400">Résultat de l'examen</p>
        <p className="mt-2 text-4xl font-extrabold text-brand-600 dark:text-brand-400">
          {examRecord.scorePercent}%
        </p>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {examRecord.correctCount} / {examRecord.totalQuestions} bonnes réponses
        </p>
      </Card>

      {examRecord.weakTopics.length > 0 && (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <h3 className="mb-2 font-semibold text-amber-900 dark:text-amber-200">Thèmes à renforcer</h3>
          <div className="flex flex-wrap gap-2">
            {examRecord.weakTopics.map((t) => (
              <Badge key={t} tone="warning">
                {TOPIC_LABELS[t]}
              </Badge>
            ))}
          </div>
          <Button
            size="sm"
            className="mt-3"
            onClick={() =>
              navigate("/pratique", {
                state: {
                  title: "Révision post-examen",
                  questionIds: incorrectIds,
                },
              })
            }
          >
            Réviser mes erreurs de cet examen
          </Button>
        </Card>
      )}

      <Card>
        <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Corrections détaillées</h3>
        <div className="space-y-3">
          {answers.map((a, i) => {
            const q = questionById.get(a.questionId);
            if (!q) return null;
            return (
              <div
                key={a.questionId}
                className={`rounded-lg border p-3 text-sm ${
                  a.correct
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
                    : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className={a.correct ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                    {a.correct ? "✓" : "✗"}
                  </span>
                  <span className="text-xs text-slate-400">Question {i + 1}</span>
                  <Badge tone="brand">{TOPIC_LABELS[q.topic]}</Badge>
                </div>
                <p className="mb-1 font-medium text-slate-800 dark:text-slate-100">{q.prompt}</p>
                <div className="text-slate-600 dark:text-slate-400">
                  <RichText text={q.explanation} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-center gap-2">
        <Button variant="secondary" onClick={() => navigate("/examen")}>
          Nouvel examen
        </Button>
        <Button variant="ghost" onClick={() => navigate("/")}>
          Accueil
        </Button>
      </div>
    </div>
  );
}
