import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { allQuestions } from "@/data/questions";
import { LEVEL_LABELS, TOPIC_LABELS, TOPICS, type Level, type Topic } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import { computeStats } from "@/engine/stats";
import { pickForReview, pickRandom } from "@/engine/selection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";

const LEVELS = [1, 2, 3, 4, 5, 6] as Level[];

export function HomePage() {
  const navigate = useNavigate();
  const { progress } = useProgress();
  const stats = useMemo(() => computeStats(allQuestions, progress), [progress]);

  const startSession = (title: string, ids: string[]) => navigate("/pratique", { state: { title, questionIds: ids } });

  const handleContinue = () =>
    startSession(
      "Continuer",
      pickForReview(allQuestions, progress, 15).map((q) => q.id),
    );
  const handleQuickReview = () =>
    startSession(
      "Révision rapide — 10 questions",
      pickRandom(allQuestions, 10).map((q) => q.id),
    );
  const handleRandomMode = () =>
    startSession(
      "Mode aléatoire",
      pickRandom(allQuestions, 20).map((q) => q.id),
    );

  const goToTopic = (topic: Topic) => navigate("/exercices", { state: { presetTopic: topic } });
  const goToLevel = (level: Level) => navigate("/exercices", { state: { presetLevel: level } });

  const recentQuestions = stats.recentlyWorkedIds
    .slice(0, 5)
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter(Boolean);
  const difficultQuestions = stats.difficultIds
    .slice(0, 5)
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          Python Training <span className="text-brand-600 dark:text-brand-400">Lab</span>
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Learn it. Break it. Understand it.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={handleContinue}>▶ Continuer</Button>
          <Button variant="secondary" onClick={handleQuickReview}>
            ⚡ Révision rapide
          </Button>
          <Button variant="secondary" onClick={handleRandomMode}>
            🎲 Mode aléatoire
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.totalQuestions}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">questions</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {Math.round(stats.accuracy * 100)}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">taux de réussite</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.answeredQuestions}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">questions travaillées</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{stats.streak.current}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">jours de suite 🔥</p>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">Progression globale</h2>
        <Card>
          <ProgressBar value={stats.totalQuestions > 0 ? stats.masteredCount / stats.totalQuestions : 0} />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {stats.masteredCount} / {stats.totalQuestions} questions déjà réussies au moins une fois
          </p>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">Niveaux</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((level) => {
            const count = allQuestions.filter((q) => q.level === level).length;
            return (
              <Card
                key={level}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => goToLevel(level)}
              >
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  Niveau {level} — {LEVEL_LABELS[level]}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{count} questions</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">Thèmes</h2>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => {
            const count = allQuestions.filter((q) => q.topic === topic).length;
            return (
              <button key={topic} onClick={() => goToTopic(topic)}>
                <Badge tone="brand">
                  {TOPIC_LABELS[topic]} · {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-100">Questions récemment travaillées</h3>
          {recentQuestions.length === 0 ? (
            <p className="text-sm text-slate-400">Rien pour l'instant — commence une session !</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {recentQuestions.map((q) => (
                <li key={q!.id} className="truncate text-slate-600 dark:text-slate-400">
                  {q!.prompt}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold text-slate-800 dark:text-slate-100">Questions difficiles</h3>
          {difficultQuestions.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune question difficile identifiée pour l'instant.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {difficultQuestions.map((q) => (
                <li key={q!.id} className="truncate text-slate-600 dark:text-slate-400">
                  {q!.prompt}
                </li>
              ))}
            </ul>
          )}
          {difficultQuestions.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={() => navigate("/revision")}
            >
              Voir la révision →
            </Button>
          )}
        </Card>
      </section>
    </div>
  );
}
