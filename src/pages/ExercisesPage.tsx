import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { allQuestions } from "@/data/questions";
import {
  DIFFICULTY_STARS,
  LEVEL_LABELS,
  QUESTION_TYPE_LABELS,
  TOPIC_LABELS,
  TOPICS,
  type Difficulty,
  type Level,
  type QuestionType,
  type Topic,
} from "@/types";
import { filterQuestions } from "@/engine/selection";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";

const LEVELS: Level[] = [1, 2, 3, 4, 5, 6];
const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5];
const TYPES: QuestionType[] = [
  "multiple-choice",
  "true-false",
  "text",
  "code-output",
  "code-editor",
  "fill-code",
  "matching",
  "ordering",
];

function toggleInSet<T>(set: T[], value: T): T[] {
  return set.includes(value) ? set.filter((v) => v !== value) : [...set, value];
}

interface PresetState {
  presetLevel?: Level;
  presetTopic?: Topic;
}

export function ExercisesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const preset = location.state as PresetState | null;

  const [levels, setLevels] = useState<Level[]>(preset?.presetLevel ? [preset.presetLevel] : []);
  const [topics, setTopics] = useState<Topic[]>(preset?.presetTopic ? [preset.presetTopic] : []);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [types, setTypes] = useState<QuestionType[]>([]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => filterQuestions(allQuestions, { levels, topics, difficulties, types, search }),
    [levels, topics, difficulties, types, search],
  );

  const startSession = (shuffle: boolean) => {
    const ids = filtered.map((q) => q.id);
    navigate("/pratique", {
      state: { title: "Exercices filtrés", questionIds: shuffle ? [...ids].sort(() => Math.random() - 0.5) : ids },
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <Card>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Recherche</p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mot-clé, tag..."
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </Card>

        <Card>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Niveau</p>
          <div className="flex flex-wrap gap-1.5">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevels(toggleInSet(levels, l))}>
                <Badge tone={levels.includes(l) ? "brand" : "neutral"}>{LEVEL_LABELS[l]}</Badge>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Thème</p>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map((t) => (
              <button key={t} onClick={() => setTopics(toggleInSet(topics, t))}>
                <Badge tone={topics.includes(t) ? "brand" : "neutral"}>{TOPIC_LABELS[t]}</Badge>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Difficulté</p>
          <div className="flex flex-wrap gap-1.5">
            {DIFFICULTIES.map((d) => (
              <button key={d} onClick={() => setDifficulties(toggleInSet(difficulties, d))}>
                <Badge tone={difficulties.includes(d) ? "brand" : "neutral"}>{DIFFICULTY_STARS[d]}</Badge>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Type de question</p>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button key={t} onClick={() => setTypes(toggleInSet(types, t))}>
                <Badge tone={types.includes(t) ? "brand" : "neutral"}>{QUESTION_TYPE_LABELS[t]}</Badge>
              </button>
            ))}
          </div>
        </Card>

        {(levels.length > 0 || topics.length > 0 || difficulties.length > 0 || types.length > 0 || search) && (
          <button
            className="text-xs text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300"
            onClick={() => {
              setLevels([]);
              setTopics([]);
              setDifficulties([]);
              setTypes([]);
              setSearch("");
            }}
          >
            Réinitialiser les filtres
          </button>
        )}
      </aside>

      <div className="space-y-4">
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-slate-100">{filtered.length}</strong> question(s)
            correspondante(s)
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => startSession(false)} disabled={filtered.length === 0}>
              Commencer dans l'ordre
            </Button>
            <Button size="sm" onClick={() => startSession(true)} disabled={filtered.length === 0}>
              Mélanger et commencer
            </Button>
          </div>
        </Card>

        <div className="space-y-2">
          {filtered.slice(0, 60).map((q) => (
            <Card
              key={q.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() =>
                navigate("/pratique", { state: { title: "Question", questionIds: [q.id] } })
              }
            >
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                <Badge tone="brand">{TOPIC_LABELS[q.topic]}</Badge>
                <Badge>{QUESTION_TYPE_LABELS[q.type]}</Badge>
                <StarRating value={q.difficulty} />
              </div>
              <p className="truncate text-sm text-slate-800 dark:text-slate-200">{q.prompt}</p>
            </Card>
          ))}
          {filtered.length > 60 && (
            <p className="text-center text-xs text-slate-400">
              Affichage limité aux 60 premiers résultats — affine tes filtres pour voir plus précisément.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
