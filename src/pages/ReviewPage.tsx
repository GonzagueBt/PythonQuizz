import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { allQuestions, questionById } from "@/data/questions";
import { useProgress } from "@/hooks/useProgress";
import { computeStats } from "@/engine/stats";
import { suggestRevisions } from "@/engine/smartReview";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function ReviewSection({
  title,
  description,
  ids,
  emptyText,
  onStart,
}: {
  title: string;
  description: string;
  ids: string[];
  emptyText: string;
  onStart: () => void;
}) {
  const questions = ids.map((id) => questionById.get(id)).filter(Boolean);
  return (
    <Card>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">
            {title} <span className="text-slate-400">({questions.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {questions.length > 0 && (
          <Button size="sm" onClick={onStart}>
            S'entraîner
          </Button>
        )}
      </div>
      {questions.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyText}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
          {questions.slice(0, 5).map((q) => (
            <li key={q!.id} className="truncate">
              {q!.prompt}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function ReviewPage() {
  const navigate = useNavigate();
  const { progress } = useProgress();
  const stats = useMemo(() => computeStats(allQuestions, progress), [progress]);
  const suggestions = useMemo(() => suggestRevisions(allQuestions, progress), [progress]);

  const start = (title: string, ids: string[]) => navigate("/pratique", { state: { title, questionIds: ids } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Révision</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Reviens sur ce qui compte le plus : erreurs, questions difficiles, favoris.
        </p>
      </div>

      {suggestions.length > 0 && (
        <Card className="border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-950/30">
          <h3 className="mb-2 font-semibold text-brand-900 dark:text-brand-200">🧠 Que dois-je réviser ?</h3>
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.tag} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-brand-900 dark:text-brand-100">
                    Tu fais beaucoup d'erreurs sur <strong>{s.tag}</strong> ({Math.round(s.accuracy * 100)}% de
                    réussite)
                  </p>
                </div>
                <Button size="sm" onClick={() => start(`Révision : ${s.tag}`, s.questionIds)}>
                  Réviser
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ReviewSection
        title="Mes erreurs"
        description="Questions jamais réussies parmi celles déjà tentées"
        ids={stats.neverCorrectIds}
        emptyText="Aucune erreur en attente de révision — bravo !"
        onStart={() => start("Mes erreurs", stats.neverCorrectIds)}
      />
      <ReviewSection
        title="Questions difficiles"
        description="Marquées manuellement ou avec un faible taux de réussite"
        ids={stats.difficultIds}
        emptyText="Aucune question difficile identifiée."
        onStart={() => start("Questions difficiles", stats.difficultIds)}
      />
      <ReviewSection
        title="Favoris"
        description="Questions marquées ⭐ à revoir"
        ids={stats.favoriteIds}
        emptyText="Aucun favori pour l'instant — marque des questions avec l'étoile."
        onStart={() => start("Favoris", stats.favoriteIds)}
      />
      <ReviewSection
        title="Récemment vues"
        description="Les 10 dernières questions travaillées"
        ids={stats.recentlyWorkedIds}
        emptyText="Aucun historique pour l'instant."
        onStart={() => start("Récemment vues", stats.recentlyWorkedIds)}
      />

      <div className="flex justify-center">
        <Badge>
          {stats.answeredQuestions} questions travaillées sur {stats.totalQuestions}
        </Badge>
      </div>
    </div>
  );
}
