import { useMemo, useState } from "react";
import { allQuestions } from "@/data/questions";
import { DIFFICULTY_STARS, TOPIC_LABELS } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import { computeStats } from "@/engine/stats";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BarChart } from "@/components/charts/BarChart";

export function ProgressPage() {
  const { progress, reset } = useProgress();
  const stats = useMemo(() => computeStats(allQuestions, progress), [progress]);
  const [confirmReset, setConfirmReset] = useState(false);

  const topicData = stats.perTopic
    .filter((t) => t.total > 0)
    .sort((a, b) => b.attempts - a.attempts)
    .map((t) => ({ label: TOPIC_LABELS[t.topic], value: t.accuracy, sublabel: `${t.attempts} tentatives` }));

  const difficultyData = stats.perDifficulty
    .filter((d) => d.total > 0)
    .map((d) => ({ label: DIFFICULTY_STARS[d.difficulty], value: d.accuracy }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Progression</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Statistiques calculées à partir de ton historique local.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {Math.round(stats.accuracy * 100)}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">taux de réussite global</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.totalAttempts}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">tentatives</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.masteredCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">questions maîtrisées</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.streak.best}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">meilleur streak (jours)</p>
        </Card>
      </section>

      <Card>
        <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Taux de réussite par thème</h3>
        <BarChart data={topicData} />
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Taux de réussite par difficulté</h3>
        <BarChart data={difficultyData} />
      </Card>

      {progress.exams.length > 0 && (
        <Card>
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">Historique des examens</h3>
          <div className="space-y-2">
            {[...progress.exams]
              .reverse()
              .slice(0, 10)
              .map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                >
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date(exam.finishedAt).toLocaleDateString()} — {exam.totalQuestions} questions
                  </span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">{exam.scorePercent}%</span>
                </div>
              ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-100">Données locales</h3>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Toute ta progression est stockée uniquement dans ce navigateur (localStorage). Aucun compte, aucun serveur.
        </p>
        {confirmReset ? (
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={() => { reset(); setConfirmReset(false); }}>
              Confirmer la réinitialisation
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
              Annuler
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)}>
            Réinitialiser ma progression
          </Button>
        )}
      </Card>
    </div>
  );
}
