import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { allQuestions } from "@/data/questions";
import { LEVEL_LABELS, TOPIC_LABELS, TOPICS, type Level, type Topic } from "@/types";
import { filterQuestions, pickRandom } from "@/engine/selection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const LEVELS: Level[] = [1, 2, 3, 4, 5, 6];

export function ExamSetupPage() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level | "mixed">("mixed");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [count, setCount] = useState(20);
  const [timed, setTimed] = useState(false);
  const [minutes, setMinutes] = useState(20);

  const toggleTopic = (t: Topic) =>
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const availableCount = filterQuestions(allQuestions, {
    levels: level === "mixed" ? undefined : [level],
    topics: topics.length > 0 ? topics : undefined,
  }).length;

  const handleStart = () => {
    const pool = filterQuestions(allQuestions, {
      levels: level === "mixed" ? undefined : [level],
      topics: topics.length > 0 ? topics : undefined,
    });
    const selected = pickRandom(pool, Math.min(count, pool.length));
    navigate("/examen/session", {
      state: {
        questionIds: selected.map((q) => q.id),
        level,
        topics,
        timerMinutes: timed ? minutes : undefined,
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mode Examen</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Aucune explication immédiate pendant l'examen — la correction complète arrive à la fin.
        </p>
      </div>

      <Card>
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Niveau</p>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setLevel("mixed")}>
            <Badge tone={level === "mixed" ? "brand" : "neutral"}>Tous niveaux</Badge>
          </button>
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)}>
              <Badge tone={level === l ? "brand" : "neutral"}>{LEVEL_LABELS[l]}</Badge>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Thèmes (optionnel — laisser vide pour tous)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map((t) => (
            <button key={t} onClick={() => toggleTopic(t)}>
              <Badge tone={topics.includes(t) ? "brand" : "neutral"}>{TOPIC_LABELS[t]}</Badge>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nombre de questions
          </label>
          <input
            type="number"
            min={5}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-28 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <span className="ml-2 text-xs text-slate-400">{availableCount} questions disponibles pour ces filtres</span>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
            Limiter le temps
          </label>
          {timed && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={180}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-20 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">minutes</span>
            </div>
          )}
        </div>
      </Card>

      <Button onClick={handleStart} disabled={availableCount === 0}>
        Démarrer l'examen ({Math.min(count, availableCount)} questions)
      </Button>
    </div>
  );
}
